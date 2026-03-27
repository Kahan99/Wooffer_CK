const MonitoringMetric = require('../models/MonitoringMetric');
const Service = require('../models/Service');
const Project = require('../models/Project');
const Alert = require('../models/Alert');
const asyncHandler = require('../utilities/asyncHandler.utility');
const ErrorHandler = require('../utilities/errorHandler.utility');
const { redisCacheClient, redisStreamClient } = require('../utilities/redis.clients');

// ─── Granularity → MongoDB date-trunc expression map ──────────────────────────
const GRANULARITY_GROUP = {
  minutely:  { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' }, hour: { $hour: '$timestamp' }, minute: { $minute: '$timestamp' } },
  hourly:    { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' }, hour: { $hour: '$timestamp' } },
  daily:     { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' } },
  weekly:    { year: { $year: '$timestamp' }, week: { $week: '$timestamp' } },
  monthly:   { year: { $year: '$timestamp' }, month: { $month: '$timestamp' } },
  quarterly: { year: { $year: '$timestamp' }, quarter: { $ceil: { $divide: [{ $month: '$timestamp' }, 3] } } },
};

// ─── Format a bucket _id to a human-readable label ────────────────────────────
function bucketLabel(id, granularity) {
  try {
    if (granularity === 'minutely') {
      return new Date(id.year, id.month - 1, id.day, id.hour, id.minute).toISOString();
    }
    if (granularity === 'hourly') {
      return new Date(id.year, id.month - 1, id.day, id.hour).toISOString();
    }
    if (granularity === 'daily') {
      return new Date(id.year, id.month - 1, id.day).toISOString();
    }
    if (granularity === 'weekly') {
      // ISO week — approximate with Jan 1 + week offset
      const jan1 = new Date(id.year, 0, 1);
      const d = new Date(jan1.getTime() + id.week * 7 * 86400000);
      return d.toISOString();
    }
    if (granularity === 'monthly') {
      return new Date(id.year, id.month - 1, 1).toISOString();
    }
    if (granularity === 'quarterly') {
      return new Date(id.year, (id.quarter - 1) * 3, 1).toISOString();
    }
  } catch { }
  return JSON.stringify(id);
}

// @desc    Collect monitoring data
// @route   POST /api/v1/monitoring/collect
// @access  Public (Protected by Tokens)
const collectMetrics = asyncHandler(async (req, res, next) => {
  const start = Date.now();
  const {
    serviceToken, cpuUsage, memoryUsage, diskUsage = 0,
    uptime, loadAvg, pid, hostname, platform, processUsage,
    apiCalls,
  } = req.body;

  if (!serviceToken) return next(new ErrorHandler('Missing service token', 400));

  // 1. Token Validation via Redis ONLY (No Mongoose in hot path)
  const authKey = `service_token:${serviceToken}`;
  const getStart = Date.now();
  let serviceData;

  try {
    const cached = await redisCacheClient.get(authKey);
    const getLatency = Date.now() - getStart;
    console.log(`📉 Redis GET latency: ${getLatency}ms`);

    if (cached) {
      serviceData = JSON.parse(cached);
    } else {
      console.log('🔍 Cache miss, fetching from MongoDB…');
      const doc = await Service.findOne({ service_token: serviceToken });

      if (doc) {
        serviceData = {
          serviceId: doc._id.toString(),
          projectId: doc.project_id.toString()
        };
        await redisCacheClient.setex(authKey, 86400, JSON.stringify(serviceData));
      }
    }
  } catch (err) {
    console.error('⚠️ Redis Ingest Error:', err.message);
  }

  if (!serviceData) return next(new ErrorHandler('Invalid tokens', 403));

  // 2. Append to Redis Stream
  const xaddStart = Date.now();
  const streamKey = 'metrics-stream';
  const message = [
    'serviceToken', serviceToken,
    'projectToken', req.body.projectToken || '',
    'serviceId', serviceData.serviceId,
    'projectId', serviceData.projectId,
    'cpuUsage', (cpuUsage || 0).toString(),
    'memoryUsage', (memoryUsage || 0).toString(),
    'diskUsage', (diskUsage || 0).toString(),
    'uptime', (uptime || 0).toString(),
    'loadAvg', JSON.stringify(loadAvg || []),
    'pid', (pid || 0).toString(),
    'hostname', hostname || '',
    'platform', platform || '',
    'processUsage', JSON.stringify(processUsage || {}),
    'apiCalls', JSON.stringify(Array.isArray(apiCalls) ? apiCalls : []),
    'timestamp', new Date().toISOString()
  ];

  await redisStreamClient.xadd(streamKey, 'MAXLEN', '~', '10000', '*', ...message);

  const xaddLatency = Date.now() - xaddStart;
  const totalLatency = Date.now() - start;

  console.log(`📉 Redis XADD latency: ${xaddLatency}ms`);
  console.log(`⚡ REAL ingestion latency: ${totalLatency}ms`);

  // Emit event for real-time dashboard updates
  if (req.app.get('io')) {
    req.app.get('io').emit(`new_metrics_${serviceData.serviceId}`);
    req.app.get('io').emit('global_usage_tick', {
      serviceId: serviceData.serviceId,
      projectId: serviceData.projectId,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(201).json({ success: true, latency: `${totalLatency}ms` });
});


// @desc    Test Redis Performance
// @route   GET /api/v1/monitoring/test-redis
// @access  Public
const testRedisPerformance = asyncHandler(async (req, res) => {
  const start = Date.now();
  await redisCacheClient.set('latency_test_key', '1');
  const setLatency = Date.now() - start;

  const getStart = Date.now();
  await redisCacheClient.get('latency_test_key');
  const getLatency = Date.now() - getStart;

  const total = Date.now() - start;

  res.status(200).json({
    success: true,
    set_latency: `${setLatency}ms`,
    get_latency: `${getLatency}ms`,
    total_latency: `${total}ms`
  });
});

// @desc    Get metrics for a service (Redis-first read pattern)
// @route   GET /api/v1/monitoring/:serviceId
// @access  Private
const getMetrics = asyncHandler(async (req, res, next) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId).populate('project_id');
  if (!service) return next(new ErrorHandler('Service not found', 404));

  // 1. Redis cache first — key: service:{serviceId}:metrics (10s TTL)
  try {
    const cacheKey = `service:${serviceId}:metrics`;
    const cachedData = await redisCacheClient.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        data: JSON.parse(cachedData)
      });
    }
  } catch (error) {
    console.error('❌ Redis Cache Read Error:', error.message);
  }

  // 2. Fallback to MongoDB, then store result in cache for 10s
  const metrics = await MonitoringMetric.find({ service_token: service.service_token })
    .sort({ timestamp: -1 })
    .limit(50);

  try {
    const cacheKey = `service:${serviceId}:metrics`;
    await redisCacheClient.setex(cacheKey, 10, JSON.stringify(metrics));
  } catch (error) {
    console.error('❌ Redis Cache Write Error:', error.message);
  }

  res.status(200).json({
    success: true,
    source: 'mongodb',
    data: metrics
  });
});

// @desc    Get aggregated/historical metrics for a service with granularity + date range
// @route   GET /api/v1/monitoring/:serviceId/aggregated
// @access  Private
const getMetricsAggregated = asyncHandler(async (req, res, next) => {
  const { serviceId } = req.params;
  const {
    granularity = 'hourly',
    from,
    to,
  } = req.query;

  // Validate granularity
  const validGranularities = ['minutely', 'hourly', 'daily', 'weekly', 'monthly', 'quarterly'];
  if (!validGranularities.includes(granularity)) {
    return next(new ErrorHandler(`Invalid granularity. Must be one of: ${validGranularities.join(', ')}`, 400));
  }

  const service = await Service.findById(serviceId);
  if (!service) return next(new ErrorHandler('Service not found', 404));

  // Build timestamp filter
  const timestampFilter = {};
  const now = new Date();

  if (from) {
    timestampFilter.$gte = new Date(from);
  } else {
    // Default: last 24 hours for minutely/hourly, last 30 days for others
    const defaultRanges = {
      minutely:  new Date(now.getTime() - 3 * 60 * 60 * 1000),     // 3 hours
      hourly:    new Date(now.getTime() - 24 * 60 * 60 * 1000),    // 24 hours
      daily:     new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days
      weekly:    new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days
      monthly:   new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), // 1 year
      quarterly: new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
    };
    timestampFilter.$gte = defaultRanges[granularity];
  }
  if (to) {
    // to should include the end of the specified day
    const toDate = new Date(to);
    toDate.setUTCHours(23, 59, 59, 999);
    timestampFilter.$lte = toDate;
  } else {
    timestampFilter.$lte = now;
  }

  const groupId = GRANULARITY_GROUP[granularity];

  // MongoDB aggregation
  const [buckets, overallStats] = await Promise.all([
    // 1. Time-series buckets
    MonitoringMetric.aggregate([
      {
        $match: {
          service_token: service.service_token,
          timestamp: timestampFilter,
        },
      },
      {
        $group: {
          _id: groupId,
          avgCpu:     { $avg: '$cpu_usage' },
          maxCpu:     { $max: '$cpu_usage' },
          minCpu:     { $min: '$cpu_usage' },
          avgMem:     { $avg: '$memory_usage' },
          maxMem:     { $max: '$memory_usage' },
          minMem:     { $min: '$memory_usage' },
          // process-level cpu pct is nested in process_usage.cpuUsagePct
          avgProcCpu: { $avg: '$process_usage.cpuUsagePct' },
          maxProcCpu: { $max: '$process_usage.cpuUsagePct' },
          minProcCpu: { $min: '$process_usage.cpuUsagePct' },
          // process memory in bytes (rss)
          avgProcMem: { $avg: '$process_usage.rss' },
          maxProcMem: { $max: '$process_usage.rss' },
          minProcMem: { $min: '$process_usage.rss' },
          avgTotalMem: { $avg: '$process_usage.totalMem' },
          maxTotalMem: { $max: '$process_usage.totalMem' },
          minTotalMem: { $min: '$process_usage.totalMem' },
          count:      { $sum: 1 },
          // earliest timestamp in bucket for ordering
          bucketTime: { $min: '$timestamp' },
        },
      },
      { $sort: { bucketTime: 1 } },
    ]),

    // 2. Overall summary + threshold crossings (flat scan)
    MonitoringMetric.aggregate([
      {
        $match: {
          service_token: service.service_token,
          timestamp: timestampFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalPoints:          { $sum: 1 },
          // System CPU
          avgCpu:               { $avg: '$cpu_usage' },
          maxCpu:               { $max: '$cpu_usage' },
          minCpu:               { $min: '$cpu_usage' },
          // System memory
          avgMem:               { $avg: '$memory_usage' },
          maxMem:               { $max: '$memory_usage' },
          minMem:               { $min: '$memory_usage' },
          // Process CPU
          avgProcCpu:           { $avg: '$process_usage.cpuUsagePct' },
          maxProcCpu:           { $max: '$process_usage.cpuUsagePct' },
          minProcCpu:           { $min: '$process_usage.cpuUsagePct' },
          // Process memory (bytes)
          avgProcMem:           { $avg: '$process_usage.rss' },
          maxProcMem:           { $max: '$process_usage.rss' },
          minProcMem:           { $min: '$process_usage.rss' },
          avgTotalMem:          { $avg: '$process_usage.totalMem' },
          maxTotalMem:          { $max: '$process_usage.totalMem' },
          minTotalMem:          { $min: '$process_usage.totalMem' },
          // Threshold crossings: cpu_usage > 80
          cpuThresholdCrossings:  { $sum: { $cond: [{ $gt: ['$cpu_usage', 80] }, 1, 0] } },
          cpuDangerousCrossings:  { $sum: { $cond: [{ $gt: ['$cpu_usage', 95] }, 1, 0] } },
          // Process threshold crossings: cpuUsagePct > 80
          procThresholdCrossings: { $sum: { $cond: [{ $gt: ['$process_usage.cpuUsagePct', 80] }, 1, 0] } },
          procDangerousCrossings: { $sum: { $cond: [{ $gt: ['$process_usage.cpuUsagePct', 95] }, 1, 0] } },
        },
      },
    ]),
  ]);

  // Format time-series buckets for front-end consumption
  const timeSeries = buckets.map((b) => ({
    label:      bucketLabel(b._id, granularity),
    bucketTime: b.bucketTime,
    count:      b.count,
    cpu:        { avg: round(b.avgCpu), max: round(b.maxCpu), min: round(b.minCpu) },
    memory:     { avg: round(b.avgMem), max: round(b.maxMem), min: round(b.minMem) },
    procCpu:    { avg: round(b.avgProcCpu), max: round(b.maxProcCpu), min: round(b.minProcCpu) },
    procMem:    {
      avg: Math.round(b.avgProcMem || 0),
      max: Math.round(b.maxProcMem || 0),
      min: Math.round(b.minProcMem || 0),
    },
    procMemPressure: {
      avg: percent(b.avgProcMem, b.avgTotalMem),
      max: percent(b.maxProcMem, b.maxTotalMem),
      min: percent(b.minProcMem, b.minTotalMem),
    },
  }));

  const s = overallStats[0] || {};
  const summary = {
    totalPoints:           s.totalPoints || 0,
    // System CPU
    avgCpu:                round(s.avgCpu),
    maxCpu:                round(s.maxCpu),
    minCpu:                round(s.minCpu),
    // System Memory
    avgMem:                round(s.avgMem),
    maxMem:                round(s.maxMem),
    minMem:                round(s.minMem),
    // Process CPU
    avgProcCpu:            round(s.avgProcCpu),
    maxProcCpu:            round(s.maxProcCpu),
    minProcCpu:            round(s.minProcCpu),
    // Process Memory (bytes → MB for readability)
    avgProcMemMB:          toMB(s.avgProcMem),
    maxProcMemMB:          toMB(s.maxProcMem),
    minProcMemMB:          toMB(s.minProcMem),
    avgProcMemPressure:    percent(s.avgProcMem, s.avgTotalMem),
    maxProcMemPressure:    percent(s.maxProcMem, s.maxTotalMem),
    minProcMemPressure:    percent(s.minProcMem, s.minTotalMem),
    // Threshold crossings
    cpuThresholdCrossings:  s.cpuThresholdCrossings  || 0,
    cpuDangerousCrossings:  s.cpuDangerousCrossings  || 0,
    procThresholdCrossings: s.procThresholdCrossings || 0,
    procDangerousCrossings: s.procDangerousCrossings || 0,
  };

  res.status(200).json({
    success: true,
    granularity,
    from: timestampFilter.$gte,
    to:   timestampFilter.$lte,
    summary,
    timeSeries,
  });
});

// @desc    Get global real-time usage across user's active services/projects
// @route   GET /api/v1/monitoring/overview/realtime
// @access  Private
const getGlobalRealtimeUsage = asyncHandler(async (req, res) => {
  const now = new Date();
  const activeWindowStart = new Date(now.getTime() - 2 * 60 * 1000);
  const trendWindowStart = new Date(now.getTime() - 15 * 60 * 1000);

  const projects = await Project.find({
    $or: [{ user_id: req.user.id }, { 'contributors.user': req.user.id }],
  })
    .select('_id')
    .lean();

  const projectIds = projects.map((p) => p._id);
  if (!projectIds.length) {
    return res.status(200).json({
      success: true,
      data: {
        current: {
          usage: 0,
          cpu: 0,
          memory: 0,
          activeServices: 0,
          activeProjects: 0,
          totalServices: 0,
          totalProjects: 0,
          lastUpdated: now,
        },
        series: [],
      },
    });
  }

  const services = await Service.find({ project_id: { $in: projectIds } })
    .select('_id service_token project_id')
    .lean();

  if (!services.length) {
    return res.status(200).json({
      success: true,
      data: {
        current: {
          usage: 0,
          cpu: 0,
          memory: 0,
          activeServices: 0,
          activeProjects: 0,
          totalServices: 0,
          totalProjects: projectIds.length,
          lastUpdated: now,
        },
        series: [],
      },
    });
  }

  const serviceTokens = services.map((s) => s.service_token).filter(Boolean);
  const tokenToProjectId = new Map(
    services.map((s) => [s.service_token, String(s.project_id)]),
  );

  const [latestByService, trendBuckets] = await Promise.all([
    MonitoringMetric.aggregate([
      {
        $match: {
          service_token: { $in: serviceTokens },
          timestamp: { $gte: activeWindowStart },
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$service_token',
          timestamp: { $first: '$timestamp' },
          cpu: { $first: '$cpu_usage' },
          memory: { $first: '$memory_usage' },
        },
      },
    ]),
    MonitoringMetric.aggregate([
      {
        $match: {
          service_token: { $in: serviceTokens },
          timestamp: { $gte: trendWindowStart },
        },
      },
      {
        $group: {
          _id: {
            minute: {
              $dateToString: {
                format: '%Y-%m-%dT%H:%M:00.000Z',
                date: '$timestamp',
              },
            },
            serviceToken: '$service_token',
          },
          cpu: { $avg: '$cpu_usage' },
          memory: { $avg: '$memory_usage' },
          timestamp: { $max: '$timestamp' },
        },
      },
      {
        $group: {
          _id: '$_id.minute',
          cpu: { $avg: '$cpu' },
          memory: { $avg: '$memory' },
          activeServices: { $sum: 1 },
          timestamp: { $max: '$timestamp' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const activeProjectIds = new Set(
    latestByService
      .map((item) => tokenToProjectId.get(item._id))
      .filter(Boolean),
  );

  const avgCpu = latestByService.length
    ? latestByService.reduce((acc, item) => acc + (item.cpu || 0), 0) / latestByService.length
    : 0;
  const avgMemory = latestByService.length
    ? latestByService.reduce((acc, item) => acc + (item.memory || 0), 0) / latestByService.length
    : 0;
  const usage = (avgCpu + avgMemory) / 2;

  const series = trendBuckets.map((bucket) => {
    const cpu = round(bucket.cpu || 0);
    const memory = round(bucket.memory || 0);
    return {
      timestamp: bucket._id,
      time: new Date(bucket._id).toISOString(),
      cpu,
      memory,
      usage: round((cpu + memory) / 2),
      activeServices: bucket.activeServices || 0,
    };
  });

  const lastUpdated = latestByService.length
    ? latestByService
        .map((item) => new Date(item.timestamp || 0).getTime())
        .reduce((a, b) => Math.max(a, b), 0)
    : now.getTime();

  res.status(200).json({
    success: true,
    data: {
      current: {
        usage: round(usage),
        cpu: round(avgCpu),
        memory: round(avgMemory),
        activeServices: latestByService.length,
        activeProjects: activeProjectIds.size,
        totalServices: services.length,
        totalProjects: projectIds.length,
        lastUpdated: new Date(lastUpdated),
      },
      series,
    },
  });
});

// @desc    Get real dashboard usage data across user projects/services
// @route   GET /api/v1/monitoring/overview/dashboard
// @access  Private
const getGlobalUsageDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const range = String(req.query.range || '24h').toLowerCase();
  const rangeMsMap = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  const rangeMs = rangeMsMap[range] || rangeMsMap['24h'];
  const from = new Date(now.getTime() - rangeMs);
  const activeWindowStart = new Date(now.getTime() - 2 * 60 * 1000);

  const projects = await Project.find({
    $or: [{ user_id: req.user.id }, { 'contributors.user': req.user.id }],
  })
    .select('_id')
    .lean();

  const projectIds = projects.map((p) => p._id);
  if (!projectIds.length) {
    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRequests: 0,
          avgLatency: 0,
          errorRate: 0,
          activeServices: 0,
          activeProjects: 0,
          totalServices: 0,
          totalProjects: 0,
          usage: 0,
          cpu: 0,
          memory: 0,
        },
        series: [],
        apiDistribution: [],
        recentAlerts: [],
        serviceActivity: [],
      },
    });
  }

  const services = await Service.find({ project_id: { $in: projectIds } })
    .select('_id service_token project_id service_name')
    .lean();

  if (!services.length) {
    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRequests: 0,
          avgLatency: 0,
          errorRate: 0,
          activeServices: 0,
          activeProjects: 0,
          totalServices: 0,
          totalProjects: projectIds.length,
          usage: 0,
          cpu: 0,
          memory: 0,
        },
        series: [],
        apiDistribution: [],
        recentAlerts: [],
        serviceActivity: [],
      },
    });
  }

  const serviceTokens = services.map((s) => s.service_token).filter(Boolean);
  const tokenToProjectId = new Map(services.map((s) => [s.service_token, String(s.project_id)]));
  const tokenToServiceName = new Map(services.map((s) => [s.service_token, s.service_name]));
  const tokenToServiceId = new Map(services.map((s) => [s.service_token, String(s._id)]));
  const serviceIdToName = new Map(services.map((s) => [String(s._id), s.service_name]));

  const baseMatch = {
    service_token: { $in: serviceTokens },
    timestamp: { $gte: from, $lte: now },
  };

  const bucketFormat = range === '24h' ? '%m-%d %H:00' : '%Y-%m-%d';

  const [
    currentByService,
    summaryMetrics,
    seriesBuckets,
    apiDistributionRaw,
    recentAlertsRaw,
    alertCountsByService,
  ] = await Promise.all([
    MonitoringMetric.aggregate([
      {
        $match: {
          service_token: { $in: serviceTokens },
          timestamp: { $gte: activeWindowStart },
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$service_token',
          timestamp: { $first: '$timestamp' },
          cpu: { $first: '$cpu_usage' },
          memory: { $first: '$memory_usage' },
          uptime: { $first: '$uptime' },
        },
      },
    ]),
    MonitoringMetric.aggregate([
      { $match: baseMatch },
      {
        $project: {
          cpu_usage: 1,
          memory_usage: 1,
          callsCount: { $size: { $ifNull: ['$api_calls', []] } },
          failedCount: {
            $size: {
              $filter: {
                input: { $ifNull: ['$api_calls', []] },
                as: 'call',
                cond: {
                  $or: [
                    { $eq: ['$$call.success', false] },
                    { $gte: ['$$call.statusCode', 400] },
                  ],
                },
              },
            },
          },
          latencySum: {
            $sum: {
              $map: {
                input: { $ifNull: ['$api_calls', []] },
                as: 'call',
                in: { $ifNull: ['$$call.responseTimeMs', 0] },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          avgCpu: { $avg: '$cpu_usage' },
          avgMemory: { $avg: '$memory_usage' },
          totalRequests: { $sum: '$callsCount' },
          totalErrors: { $sum: '$failedCount' },
          totalLatency: { $sum: '$latencySum' },
        },
      },
    ]),
    MonitoringMetric.aggregate([
      { $match: baseMatch },
      {
        $project: {
          timestamp: 1,
          cpu_usage: 1,
          memory_usage: 1,
          callsCount: { $size: { $ifNull: ['$api_calls', []] } },
          failedCount: {
            $size: {
              $filter: {
                input: { $ifNull: ['$api_calls', []] },
                as: 'call',
                cond: {
                  $or: [
                    { $eq: ['$$call.success', false] },
                    { $gte: ['$$call.statusCode', 400] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            label: {
              $dateToString: {
                format: bucketFormat,
                date: '$timestamp',
              },
            },
            time: {
              $dateToString: {
                format: '%Y-%m-%dT%H:00:00.000Z',
                date: '$timestamp',
              },
            },
          },
          requests: { $sum: '$callsCount' },
          errors: { $sum: '$failedCount' },
          cpu: { $avg: '$cpu_usage' },
          memory: { $avg: '$memory_usage' },
        },
      },
      { $sort: { '_id.time': 1 } },
    ]),
    MonitoringMetric.aggregate([
      { $match: baseMatch },
      { $unwind: '$api_calls' },
      {
        $project: {
          endpoint: '$api_calls.endpoint',
        },
      },
      {
        $match: {
          endpoint: { $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$endpoint',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Alert.find({
      projectId: { $in: projectIds },
      timestamp: { $gte: from, $lte: now },
    })
      .sort({ timestamp: -1 })
      .limit(8)
      .select('_id serviceId level message timestamp')
      .lean(),
    Alert.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          timestamp: { $gte: from, $lte: now },
        },
      },
      {
        $group: {
          _id: '$serviceId',
          incidents: { $sum: 1 },
        },
      },
    ]),
  ]);

  const currentCpu = currentByService.length
    ? currentByService.reduce((acc, item) => acc + (item.cpu || 0), 0) / currentByService.length
    : 0;
  const currentMemory = currentByService.length
    ? currentByService.reduce((acc, item) => acc + (item.memory || 0), 0) / currentByService.length
    : 0;

  const activeProjectIds = new Set(
    currentByService
      .map((item) => tokenToProjectId.get(item._id))
      .filter(Boolean),
  );

  const metrics = summaryMetrics[0] || {};
  const totalRequests = metrics.totalRequests || 0;
  const totalErrors = metrics.totalErrors || 0;
  const avgLatency = totalRequests > 0 ? metrics.totalLatency / totalRequests : 0;
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

  const series = seriesBuckets.map((bucket) => {
    const cpu = round(bucket.cpu || 0);
    const memory = round(bucket.memory || 0);
    return {
      label: bucket._id.label,
      time: bucket._id.time,
      requests: bucket.requests || 0,
      errors: bucket.errors || 0,
      cpu,
      memory,
      usage: round((cpu + memory) / 2),
    };
  });

  const apiDistribution = apiDistributionRaw.map((item) => ({
    name: String(item._id),
    count: item.count || 0,
  }));

  const recentAlerts = recentAlertsRaw.map((alert) => ({
    id: alert._id,
    service: serviceIdToName.get(String(alert.serviceId)) || 'Unknown service',
    level: alert.level,
    message: alert.message,
    timestamp: alert.timestamp,
  }));

  const incidentsByServiceId = new Map(
    alertCountsByService.map((item) => [String(item._id), item.incidents || 0]),
  );

  const serviceActivity = currentByService
    .map((item) => {
      const usage = Number(((item.cpu || 0) + (item.memory || 0)) / 2);
      let status = 'Healthy';
      if (usage >= 90) status = 'Critical';
      else if (usage >= 75) status = 'Warning';

      const seconds = Number(item.uptime || 0);
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);

      return {
        id: item._id,
        name: tokenToServiceName.get(item._id) || 'Unknown service',
        status,
        uptime: days > 0 ? `${days}d ${hours}h` : `${hours}h`,
        incidents: incidentsByServiceId.get(tokenToServiceId.get(item._id)) || 0,
        cpu: round(item.cpu || 0),
        memory: round(item.memory || 0),
      };
    })
    .sort((a, b) => {
      const rank = { Critical: 3, Warning: 2, Healthy: 1 };
      return (rank[b.status] || 0) - (rank[a.status] || 0);
    });

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalRequests,
        avgLatency: round(avgLatency),
        errorRate: round(errorRate),
        activeServices: currentByService.length,
        activeProjects: activeProjectIds.size,
        totalServices: services.length,
        totalProjects: projectIds.length,
        usage: round((currentCpu + currentMemory) / 2),
        cpu: round(currentCpu),
        memory: round(currentMemory),
      },
      series,
      apiDistribution,
      recentAlerts,
      serviceActivity,
    },
  });
});

// ─── Small pure helpers ────────────────────────────────────────────────────────
const round = (v, dp = 2) => (v != null ? Math.round(v * 10 ** dp) / 10 ** dp : null);
const toMB  = (bytes)     => (bytes != null ? Math.round(bytes / 1024 / 1024) : null);
const percent = (part, total, dp = 2) => {
  if (part == null || total == null || total <= 0) return null;
  return round((part / total) * 100, dp);
};

module.exports = {
  collectMetrics,
  getMetrics,
  getMetricsAggregated,
  getGlobalRealtimeUsage,
  getGlobalUsageDashboard,
  testRedisPerformance,
};

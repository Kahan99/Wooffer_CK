const MonitoringMetric = require('../models/MonitoringMetric');
const Service = require('../models/Service');
const asyncHandler = require('../utilities/asyncHandler.utility');
const ErrorHandler = require('../utilities/errorHandler.utility');
const { redisCacheClient, redisStreamClient } = require('../utilities/redis.clients');

// @desc    Collect monitoring data
// @route   POST /api/v1/monitoring/collect
// @access  Public (Protected by Tokens)
const collectMetrics = asyncHandler(async (req, res, next) => {
  const start = Date.now();
  const {
    serviceToken, cpuUsage, memoryUsage, diskUsage = 0,
    uptime, loadAvg, pid, hostname, platform, processUsage,
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
    'timestamp', new Date().toISOString()
  ];

  await redisStreamClient.xadd(streamKey, 'MAXLEN', '~', '10000', '*', ...message);

  const xaddLatency = Date.now() - xaddStart;
  const totalLatency = Date.now() - start;

  console.log(`📉 Redis XADD latency: ${xaddLatency}ms`);
  console.log(`⚡ REAL ingestion latency: ${totalLatency}ms`);

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

module.exports = {
  collectMetrics,
  getMetrics,
  testRedisPerformance
};

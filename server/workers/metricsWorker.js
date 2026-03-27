const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MonitoringMetric = require('../models/MonitoringMetric');
const Alert = require('../models/Alert');
const Service = require('../models/Service');
const Project = require('../models/Project');
const User = require('../models/user.model');
const sendEmail = require('../utilities/sendEmail.utility');
const { createNotificationsForUsers } = require('../utilities/notification.utility');
const { connectDB } = require('../db/connection');
const { redisCacheClient, redisStreamClient } = require('../utilities/redis.clients');

dotenv.config();

const STREAM_KEY = 'metrics-stream';
const GROUP_NAME = 'metrics-group';
const CONSUMER_NAME = `worker-${process.pid}`;
const BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 2000;
const ALERT_COOLDOWN_SEC = 300;
const PROCESS_MEM_GROWTH_RATIO = 1.2;
const PROCESS_MEM_GROWTH_MIN_BYTES = 50 * 1024 * 1024; // 50 MB

let batch = [];
let pendingAcks = [];
const serviceContextCache = new Map();

const MEMORY_BYTES = {
  MB: 1024 * 1024,
};

function safeObjectId(id) {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

function fmtPct(value) {
  return `${Number(value).toFixed(2)}%`;
}

function fmtBytesToMB(value) {
  return `${Math.round(Number(value) / MEMORY_BYTES.MB)} MB`;
}

function metricRules(metric, previousProcessMem) {
  const rules = [];

  const systemCpu = Number(metric.cpu_usage || 0);
  const systemMemory = Number(metric.memory_usage || 0);
  const processCpu = Number(metric.process_usage?.cpuUsagePct || 0);
  const processMemory = Number(metric.process_usage?.rss || 0);

  if (systemCpu > 95) {
    rules.push({
      dedupeType: 'cpu_critical',
      type: 'cpu',
      level: 'CRITICAL',
      value: systemCpu,
      threshold: 95,
      message: `High CPU usage detected: ${fmtPct(systemCpu)} (threshold ${fmtPct(95)}).`,
    });
  } else if (systemCpu > 80) {
    rules.push({
      dedupeType: 'cpu_warning',
      type: 'cpu',
      level: 'WARNING',
      value: systemCpu,
      threshold: 80,
      message: `CPU usage warning: ${fmtPct(systemCpu)} (threshold ${fmtPct(80)}).`,
    });
  }

  if (systemMemory > 90) {
    rules.push({
      dedupeType: 'memory_critical',
      type: 'memory',
      level: 'CRITICAL',
      value: systemMemory,
      threshold: 90,
      message: `High memory usage detected: ${fmtPct(systemMemory)} (threshold ${fmtPct(90)}).`,
    });
  } else if (systemMemory > 75) {
    rules.push({
      dedupeType: 'memory_warning',
      type: 'memory',
      level: 'WARNING',
      value: systemMemory,
      threshold: 75,
      message: `Memory usage warning: ${fmtPct(systemMemory)} (threshold ${fmtPct(75)}).`,
    });
  }

  if (processCpu > 90) {
    rules.push({
      dedupeType: 'process_cpu_critical',
      type: 'process_cpu',
      level: 'CRITICAL',
      value: processCpu,
      threshold: 90,
      message: `Process CPU critical: ${fmtPct(processCpu)} (threshold ${fmtPct(90)}).`,
    });
  } else if (processCpu > 70) {
    rules.push({
      dedupeType: 'process_cpu_warning',
      type: 'process_cpu',
      level: 'WARNING',
      value: processCpu,
      threshold: 70,
      message: `Process CPU warning: ${fmtPct(processCpu)} (threshold ${fmtPct(70)}).`,
    });
  }

  if (
    Number.isFinite(processMemory) &&
    processMemory > 0 &&
    Number.isFinite(previousProcessMem) &&
    previousProcessMem > 0
  ) {
    const growthRatio = processMemory / previousProcessMem;
    const growthBytes = processMemory - previousProcessMem;
    if (growthRatio >= PROCESS_MEM_GROWTH_RATIO && growthBytes >= PROCESS_MEM_GROWTH_MIN_BYTES) {
      rules.push({
        dedupeType: 'process_memory_growth_warning',
        type: 'process_memory_growth',
        level: 'WARNING',
        value: processMemory,
        threshold: previousProcessMem,
        message: `Process memory growth warning: ${fmtBytesToMB(previousProcessMem)} -> ${fmtBytesToMB(processMemory)}.`,
      });
    }
  }

  return rules;
}

async function resolveAlertType(serviceId, type) {
  const sid = safeObjectId(serviceId);
  if (!sid) return;
  await Alert.updateMany(
    { serviceId: sid, type, resolved: false },
    { $set: { resolved: true, resolvedAt: new Date() } },
  );
}

async function getServiceContext(serviceId, projectId) {
  const cacheKey = `${serviceId}:${projectId || ''}`;
  const cached = serviceContextCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached;

  let serviceName = `Service ${serviceId}`;
  let finalProjectId = projectId;
  const emails = new Set();

  if (process.env.ALERT_EMAIL) emails.add(process.env.ALERT_EMAIL);
  if (process.env.FROM_EMAIL) emails.add(process.env.FROM_EMAIL);
  const recipientUsers = [];

  try {
    const serviceDoc = await Service.findById(serviceId).select('service_name project_id').lean();
    if (serviceDoc?.service_name) serviceName = serviceDoc.service_name;
    if (!finalProjectId && serviceDoc?.project_id) {
      finalProjectId = serviceDoc.project_id.toString();
    }

    if (finalProjectId && mongoose.Types.ObjectId.isValid(finalProjectId)) {
      const project = await Project.findById(finalProjectId)
        .select('user_id contributors')
        .lean();

      const userIds = [];
      if (project?.user_id && mongoose.Types.ObjectId.isValid(project.user_id)) {
        userIds.push(project.user_id.toString());
      }
      for (const contributor of project?.contributors || []) {
        const cid = contributor?.user;
        if (cid && mongoose.Types.ObjectId.isValid(cid)) {
          userIds.push(cid.toString());
        }
      }

      if (userIds.length > 0) {
        const users = await User.find({ _id: { $in: [...new Set(userIds)] } })
          .select('email')
          .lean();
        for (const user of users) {
          if (user?._id && user?.email) {
            recipientUsers.push({ userId: String(user._id), email: user.email });
          }
        }
        for (const user of users) {
          if (user?.email) emails.add(user.email);
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️ Alert context lookup failed for ${serviceId}: ${err.message}`);
  }

  const context = {
    serviceName,
    projectId: finalProjectId,
    emails: [...emails],
    recipientUsers,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  serviceContextCache.set(cacheKey, context);
  return context;
}

async function createAndNotifyAlert(metric, rule) {
  const serviceId = metric._serviceId;
  const projectId = metric._projectId;
  const sid = safeObjectId(serviceId);
  const pid = safeObjectId(projectId);
  if (!sid || !pid) return;

  const dedupeKey = `alert:${serviceId}:${rule.dedupeType}`;
  const exists = await redisCacheClient.get(dedupeKey);
  if (exists) return;

  await redisCacheClient.setex(dedupeKey, ALERT_COOLDOWN_SEC, '1');

  const alert = await Alert.create({
    serviceId: sid,
    projectId: pid,
    type: rule.type,
    level: rule.level,
    message: rule.message,
    value: Number(rule.value),
    threshold: Number(rule.threshold),
    timestamp: metric.timestamp || new Date(),
    resolved: false,
  });
  console.log(`🚨 Alert created [${rule.level}] ${rule.type} for service ${serviceId}`);

  const context = await getServiceContext(serviceId, projectId);
  if (context.emails.length === 0) {
    console.warn(`⚠️ No alert recipients found for service ${serviceId}`);
    return;
  }

  const subject = `[${rule.level}] High ${rule.type.replace(/_/g, ' ').toUpperCase()} Detected`;
  const useBytes = rule.type === 'process_memory_growth';
  const message = [
    `Service Name: ${context.serviceName}`,
    `Metric Type: ${rule.type}`,
    `Current Value: ${useBytes ? fmtBytesToMB(rule.value) : fmtPct(rule.value)}`,
    `Threshold: ${useBytes ? fmtBytesToMB(rule.threshold) : fmtPct(rule.threshold)}`,
    `Timestamp: ${(metric.timestamp || new Date()).toISOString()}`,
    `Alert ID: ${alert._id}`,
  ].join('\n');

  const emailResults = await Promise.allSettled(
    context.emails.map((email) => sendEmail({ email, subject, message })),
  );

  const successEmailSet = new Set();
  emailResults.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      successEmailSet.add(String(context.emails[idx]).toLowerCase());
    }
  });

  const userIdsForNotification = (context.recipientUsers || [])
    .filter((u) => successEmailSet.has(String(u.email || '').toLowerCase()))
    .map((u) => u.userId)
    .filter(Boolean);
  if (userIdsForNotification.length > 0) {
    await createNotificationsForUsers(userIdsForNotification, {
      type: 'alert_email',
      message: `${rule.level} alert email sent for ${context.serviceName}.`,
      metadata: {
        serviceId,
        projectId,
        alertId: alert._id,
        metricType: rule.type,
        level: rule.level,
      },
    });
  }

  const failures = emailResults.filter((r) => r.status === 'rejected');
  if (failures.length > 0) {
    console.error(`❌ Alert email send failed for ${failures.length}/${emailResults.length} recipients`);
    failures.forEach((f) => console.error(`   ↳ ${f.reason?.message || f.reason}`));
  } else {
    console.log(`✉️ Alert email sent to ${emailResults.length} recipient(s)`);
  }
}

async function evaluateAlertsForMetric(metric) {
  const serviceId = metric._serviceId;
  if (!serviceId) return;

  const memStateKey = `alert_state:${serviceId}:process_mem_last`;
  const prevRaw = await redisCacheClient.get(memStateKey);
  const previousProcessMem = prevRaw ? Number(prevRaw) : null;

  const rules = metricRules(metric, previousProcessMem);
  const hasRuleType = new Set(rules.map((r) => r.type));

  if (!hasRuleType.has('cpu')) {
    await resolveAlertType(serviceId, 'cpu');
    await Promise.allSettled([
      redisCacheClient.del(`alert:${serviceId}:cpu_warning`),
      redisCacheClient.del(`alert:${serviceId}:cpu_critical`),
    ]);
  }
  if (!hasRuleType.has('memory')) {
    await resolveAlertType(serviceId, 'memory');
    await Promise.allSettled([
      redisCacheClient.del(`alert:${serviceId}:memory_warning`),
      redisCacheClient.del(`alert:${serviceId}:memory_critical`),
    ]);
  }
  if (!hasRuleType.has('process_cpu')) {
    await resolveAlertType(serviceId, 'process_cpu');
    await Promise.allSettled([
      redisCacheClient.del(`alert:${serviceId}:process_cpu_warning`),
      redisCacheClient.del(`alert:${serviceId}:process_cpu_critical`),
    ]);
  }
  if (!hasRuleType.has('process_memory_growth')) {
    await resolveAlertType(serviceId, 'process_memory_growth');
    await redisCacheClient.del(`alert:${serviceId}:process_memory_growth_warning`);
  }

  for (const rule of rules) {
    await createAndNotifyAlert(metric, rule);
  }

  const currentProcMem = Number(metric.process_usage?.rss || 0);
  if (Number.isFinite(currentProcMem) && currentProcMem > 0) {
    await redisCacheClient.setex(memStateKey, 24 * 60 * 60, String(currentProcMem));
  }
}

async function processAlertsForBatch(metricsBatch) {
  if (!metricsBatch?.length) return;
  for (const metric of metricsBatch) {
    try {
      await evaluateAlertsForMetric(metric);
    } catch (err) {
      console.error(`❌ Alert processing failed for service ${metric._serviceId || 'unknown'}: ${err.message}`);
    }
  }
}

async function initStream() {
  try {
    await redisStreamClient.xgroup('CREATE', STREAM_KEY, GROUP_NAME, '$', 'MKSTREAM');
    console.log(`✅ Consumer group ${GROUP_NAME} created`);
  } catch (err) {
    if (err.message.includes('BUSYGROUP')) {
      console.log(`ℹ️  Consumer group ${GROUP_NAME} already exists`);
    } else {
      console.error('❌ Error creating consumer group:', err);
    }
  }
}

async function flushBatch() {
  if (batch.length === 0) return;

  const currentBatch = [...batch];
  const currentAcks = [...pendingAcks];
  batch = [];
  pendingAcks = [];

  try {
    // 1. Bulk insert to MongoDB
    await MonitoringMetric.insertMany(currentBatch, { ordered: false });

    // 2. Acknowledge all messages in this batch
    if (currentAcks.length > 0) {
      await redisStreamClient.xack(STREAM_KEY, GROUP_NAME, ...currentAcks);
    }

    // 3. Update Redis latest cache for each unique serviceId (10s TTL)
    //    Groups entries by serviceId and stores the most recent metric for each.
    const latestByService = {};
    for (const metric of currentBatch) {
      // serviceId is embedded in the metric object from the stream parse step
      if (metric._serviceId) {
        latestByService[metric._serviceId] = metric;
      }
    }
    const cacheWrites = Object.entries(latestByService).map(([serviceId, data]) => {
      const cacheKey = `service:${serviceId}:latest`;
      return redisCacheClient.setex(cacheKey, 10, JSON.stringify(data));
    });
    if (cacheWrites.length > 0) await Promise.all(cacheWrites);

    // 4. Alert engine in background worker path (no API latency impact)
    await processAlertsForBatch(currentBatch);

    console.log(`📦 Batch processed: ${currentBatch.length} metrics saved to MongoDB`);
  } catch (err) {
    console.error('❌ Batch Processing Error:', err.message);
  }
}

async function processMetrics() {
  console.log(`🚀 Worker ${CONSUMER_NAME} started (Batch mode: ${BATCH_SIZE} items / ${FLUSH_INTERVAL_MS}ms)`);

  // Start flush timer
  setInterval(flushBatch, FLUSH_INTERVAL_MS);

  while (true) {
    try {
      const streams = await redisStreamClient.xreadgroup(
        'GROUP', GROUP_NAME, CONSUMER_NAME,
        'COUNT', '50',
        'BLOCK', '2000',
        'STREAMS', STREAM_KEY, '>'
      );

      if (!streams) continue;

      const [, messages] = streams[0];

      for (const [id, fields] of messages) {
        // Convert flat field array → object
        const data = {};
        for (let i = 0; i < fields.length; i += 2) {
          data[fields[i]] = fields[i + 1];
        }

        try {
          // Parse the rich processUsage object sent by the npm package
          let parsedProcessUsage = {};
          try { parsedProcessUsage = JSON.parse(data.processUsage || '{}'); } catch { }
          let parsedApiCalls = [];
          try {
            const input = JSON.parse(data.apiCalls || '[]');
            parsedApiCalls = Array.isArray(input) ? input : [];
          } catch {
            parsedApiCalls = [];
          }

          const metricObj = {
            project_token: data.projectToken,
            service_token: data.serviceToken,
            cpu_usage: parseFloat(data.cpuUsage),
            memory_usage: parseFloat(data.memoryUsage),
            disk_usage: parseFloat(data.diskUsage || 0),
            uptime: parseFloat(data.uptime),
            timestamp: new Date(data.timestamp),

            // Merge loadAvg / pid / hostname / platform with the rich processUsage object
            process_usage: {
              loadAvg: JSON.parse(data.loadAvg || '[]'),
              pid: parseInt(data.pid),
              hostname: data.hostname,
              platform: data.platform,
              ...parsedProcessUsage,   // cpuModel, cpuCores, cpuSpeed, cores[], totalMem, freeMem, etc.
            },
            api_calls: parsedApiCalls,

            // Internal field for cache update in flushBatch — not persisted to Mongo
            _serviceId: data.serviceId,
            _projectId: data.projectId,
          };


          batch.push(metricObj);
          pendingAcks.push(id);

          // Immediate per-message cache update (latest snapshot, 10s TTL)
          if (data.serviceId) {
            const cacheKey = `service:${data.serviceId}:latest`;
            await redisCacheClient.setex(cacheKey, 10, JSON.stringify({ ...metricObj, _id: id }));
          }

          if (batch.length >= BATCH_SIZE) {
            await flushBatch();
          }
        } catch (err) {
          console.error(`❌ Error parsing message ${id}:`, err);
          // ACK bad messages so the worker doesn't get stuck
          await redisStreamClient.xack(STREAM_KEY, GROUP_NAME, id);
        }
      }
    } catch (err) {
      console.error('❌ Worker Loop Error:', err);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

connectDB().then(async () => {
  // Connect Redis clients before starting stream processing
  await Promise.all([
    redisCacheClient.connect(),
    redisStreamClient.connect()
  ]);
  console.log('✅ Redis State Client Ready');

  await initStream();
  processMetrics();
}).catch(err => {
  console.error('❌ Worker failed to start:', err.message);
  process.exit(1);
});

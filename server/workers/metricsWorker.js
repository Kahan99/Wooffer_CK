const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MonitoringMetric = require('../models/MonitoringMetric');
const { connectDB } = require('../db/connection');
const { redisCacheClient, redisStreamClient } = require('../utilities/redis.clients');

dotenv.config();

const STREAM_KEY = 'metrics-stream';
const GROUP_NAME = 'metrics-group';
const CONSUMER_NAME = `worker-${process.pid}`;
const BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 2000;

let batch = [];
let pendingAcks = [];

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

            // Internal field for cache update in flushBatch — not persisted to Mongo
            _serviceId: data.serviceId
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

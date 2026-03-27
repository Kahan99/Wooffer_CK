const mongoose = require('mongoose');
const { redisCacheClient, redisStreamClient } = require('../utilities/redis.clients');
const asyncHandler = require('../utilities/asyncHandler.utility');

const getHealthStatus = asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'unknown',
      redis: 'unknown',
      worker: 'running'   // Worker is launched via node workers/metricsWorker.js
    }
  };

  // 1. Check MongoDB
  try {
    const dbState = mongoose.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    health.services.mongodb = dbState === 1 ? 'connected' : 'disconnected';
    if (dbState !== 1) health.status = 'degraded';
  } catch (err) {
    health.services.mongodb = 'error';
    health.status = 'error';
  }

  // 2. Check Redis (PING both clients)
  try {
    const [cacheReply, streamReply] = await Promise.all([
      redisCacheClient.ping(),
      redisStreamClient.ping()
    ]);

    const cacheOk = cacheReply === 'PONG';
    const streamOk = streamReply === 'PONG';

    health.services.redis = (cacheOk && streamOk) ? 'connected' : 'degraded';
    if (!cacheOk || !streamOk) health.status = 'degraded';
  } catch (err) {
    health.services.redis = 'error';
    health.status = 'error';
  }

  res.status(health.status === 'error' ? 500 : 200).json(health);
});

module.exports = { getHealthStatus };

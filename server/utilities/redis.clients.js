const Redis = require('ioredis');

const REDIS_URL = 'redis://127.0.0.1:6379';

/**
 * Shared production config for all Redis clients.
 * Connects ONLY to local Docker Redis Stack (wooffer-redis container).
 */
const baseConfig = {
  lazyConnect: true,
  enableAutoPipelining: true,
  maxRetriesPerRequest: null, // Required for blocking commands (XREADGROUP)
  retryStrategy(times) {
    // Exponential backoff: 50ms, 100ms, 200ms … capped at 3000ms
    const delay = Math.min(times * 50, 3000);
    console.warn(`⚠️  Redis reconnect attempt #${times}, retrying in ${delay}ms…`);
    return delay;
  },
  reconnectOnError(err) {
    // Reconnect on READONLY errors (replica failover scenarios)
    return err.message.includes('READONLY');
  }
};

// ─── Client 1: Cache ────────────────────────────────────────────────────────
// Purpose: token validation cache, metrics cache, dashboard read cache
const redisCacheClient = new Redis(REDIS_URL, {
  ...baseConfig,
  connectionName: 'wooffer-cache',
});

redisCacheClient.on('connect', () => {
  console.log('✅ Redis Cache Client Connected');
});

redisCacheClient.on('ready', () => {
  console.log('📡 Redis Cache Client Ready');
});

redisCacheClient.on('error', (err) => {
  console.error('❌ Redis Cache Client Error:', err.message);
});

redisCacheClient.on('close', () => {
  console.warn('⚠️  Redis Cache Client Connection Closed');
});

// ─── Client 2: Stream ───────────────────────────────────────────────────────
// Purpose: XADD metrics ingestion, XREADGROUP consumer group, XACK
const redisStreamClient = new Redis(REDIS_URL, {
  ...baseConfig,
  connectionName: 'wooffer-stream',
});

redisStreamClient.on('connect', () => {
  console.log('✅ Redis Stream Client Connected');
});

redisStreamClient.on('ready', () => {
  console.log('📡 Redis Stream Client Ready');
});

redisStreamClient.on('error', (err) => {
  console.error('❌ Redis Stream Client Error:', err.message);
});

redisStreamClient.on('close', () => {
  console.warn('⚠️  Redis Stream Client Connection Closed');
});

module.exports = { redisCacheClient, redisStreamClient };

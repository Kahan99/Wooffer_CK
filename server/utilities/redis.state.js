const { redisCacheClient } = require('./redis.clients');

/**
 * Redis State Tracking Layer
 * Used to record and query per-service downtime state.
 * Key format: service:{serviceId}:downSince
 */

/**
 * Mark a service as down by storing the timestamp when it went down.
 * @param {string} serviceId - MongoDB ObjectId string of the service
 * @param {string|number} timestamp - ISO string or Unix ms timestamp
 */
async function setServiceDown(serviceId, timestamp) {
  const key = `service:${serviceId}:downSince`;
  await redisCacheClient.set(key, String(timestamp));
}

/**
 * Get the timestamp at which a service was marked as down.
 * Returns null if the service is not currently marked as down.
 * @param {string} serviceId
 * @returns {Promise<string|null>}
 */
async function getServiceDown(serviceId) {
  const key = `service:${serviceId}:downSince`;
  return redisCacheClient.get(key);
}

/**
 * Clear the down-state for a service (mark it as recovered).
 * @param {string} serviceId
 */
async function clearServiceDown(serviceId) {
  const key = `service:${serviceId}:downSince`;
  await redisCacheClient.del(key);
}

module.exports = { setServiceDown, getServiceDown, clearServiceDown };

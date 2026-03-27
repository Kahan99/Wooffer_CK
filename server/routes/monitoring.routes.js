const express = require('express');
const router = express.Router();
const { collectMetrics, getMetrics, testRedisPerformance } = require('../controllers/monitoring.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

// Public route for performance testing
router.get('/test-redis', testRedisPerformance);

// Public route for agents to send data (Validated by tokens inside controller)
router.post('/collect', collectMetrics);

// Private route for dashboard to view data
router.get('/:serviceId', isAuthenticated, getMetrics);

module.exports = router;

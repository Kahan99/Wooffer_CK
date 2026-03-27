const express = require('express');
const router = express.Router();
const {
	collectMetrics,
	getMetrics,
	getMetricsAggregated,
	getGlobalRealtimeUsage,
	getGlobalUsageDashboard,
	testRedisPerformance,
} = require('../controllers/monitoring.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

// Public route for performance testing
router.get('/test-redis', testRedisPerformance);

// Public route for agents to send data (Validated by tokens inside controller)
router.post('/collect', collectMetrics);

// Private route for global navbar usage (must be before /:serviceId routes)
router.get('/overview/realtime', isAuthenticated, getGlobalRealtimeUsage);

// Private route for usage dashboard sections
router.get('/overview/dashboard', isAuthenticated, getGlobalUsageDashboard);

// Private route — aggregated/historical metrics with granularity + date range
router.get('/:serviceId/aggregated', isAuthenticated, getMetricsAggregated);

// Private route for dashboard to view latest data (must be AFTER /aggregated to avoid param clash)
router.get('/:serviceId', isAuthenticated, getMetrics);

module.exports = router;

const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes.js');
const projectRoutes = require('./project.routes.js');
const serviceRoutes = require('./service.routes.js');
const monitoringRoutes = require('./monitoring.routes.js');
const { getHealthStatus } = require('../controllers/health.controller.js');

router.get('/health', getHealthStatus);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/services', serviceRoutes);
router.use('/monitoring', monitoringRoutes);

module.exports = router;


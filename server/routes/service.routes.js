const express = require('express');
const router = express.Router();
const {
  createService,
  getServicesByProject,
  getService,
  updateService,
  deleteService,
  getServiceLogs,
} = require('../controllers/service.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

router.use(isAuthenticated);

router.route('/create')
  .post(createService);

router.route('/project/:projectId')
  .get(getServicesByProject);

router.route('/:id/logs')
  .get(getServiceLogs);

router.route('/:id')
  .get(getService)
  .put(updateService)
  .delete(deleteService);

module.exports = router;

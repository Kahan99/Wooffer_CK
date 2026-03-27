const express = require('express');
const router = express.Router();
const { createService, getServicesByProject, getService } = require('../controllers/service.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

router.use(isAuthenticated);

router.route('/create')
  .post(createService);

router.route('/project/:projectId')
  .get(getServicesByProject);

router.route('/:id')
  .get(getService);

module.exports = router;

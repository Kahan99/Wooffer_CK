const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  clearMyNotifications,
} = require('../controllers/notification.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

router.use(isAuthenticated);

router.get('/', getMyNotifications);
router.delete('/clear', clearMyNotifications);

module.exports = router;

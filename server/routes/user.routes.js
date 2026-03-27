const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyOTP,
  setCookie,
  searchUsers
} = require('../controllers/user.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/set-cookie', setCookie);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/profile', isAuthenticated, getUserProfile);
router.put('/profile', isAuthenticated, updateProfile);
router.get('/search', isAuthenticated, searchUsers);

module.exports = router;

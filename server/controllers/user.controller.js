const asyncHandler = require('../utilities/asyncHandler.utility');
const ErrorHandler = require('../utilities/errorHandler.utility');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utilities/sendEmail.utility');

const { redisCacheClient: redisClient } = require('../utilities/redis.clients');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new ErrorHandler('Missing required fields', 400);

  let user = await User.findOne({ email });

  if (user) {
    if (user.isVerified) {
      throw new ErrorHandler('User already exists', 400);
    }
    user.name = name;
    user.password = await bcrypt.hash(password, 10);
    user.role = role || 'developer';
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });
  }

  await user.save();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const salt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(otp, salt);

  await redisClient.setex(`otp:${email}`, 600, hashedOTP);

  try {
    const message = `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`;

    await sendEmail({
      email: user.email,
      subject: 'Wooffer Account Verification',
      message
    });

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${user.email}`
    });
  } catch (err) {
    console.error("Email Error:", err);
    throw new ErrorHandler('Email could not be sent', 500);
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ErrorHandler('Missing email or OTP', 400);

  const user = await User.findOne({ email });
  if (!user) throw new ErrorHandler('User not found', 404);

  if (user.isVerified) {
    return res.status(200).json({ success: true, message: 'User already verified' });
  }

  const cachedOTP = await redisClient.get(`otp:${email}`);

  if (!cachedOTP) {
    throw new ErrorHandler('OTP expired or invalid', 400);
  }

  const isMatch = await bcrypt.compare(otp, cachedOTP);
  if (!isMatch) {
    throw new ErrorHandler('Invalid OTP', 400);
  }

  user.isVerified = true;
  await user.save();

  await redisClient.del(`otp:${email}`);

  res.status(200).json({
    success: true,
    message: 'Account verified successfully. Please login.'
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  console.log("Login Request:", { email, rememberMe }); // DEBUG LOG

  if (!email || !password) throw new ErrorHandler('Missing credentials', 400);

  const user = await User.findOne({ email });
  if (!user) throw new ErrorHandler('Invalid email or password', 400);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new ErrorHandler('Invalid email or password', 400);

  if (!user.isVerified) {
    throw new ErrorHandler('Please verify your email address', 401);
  }

  const tokenExpiresIn = rememberMe ? '2d' : '1h';
  const cookieExpires = rememberMe ? 2 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

  console.log("Setting Cookie:", { tokenExpiresIn, cookieExpires }); // DEBUG LOG

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: tokenExpiresIn }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: cookieExpires,
    domain: 'localhost' // Allow cookie sharing across subdomains
  });


  res.status(200).json({
    success: true,
    user,
    token
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
    // domain: 'localhost' // Removed to allow clearing host-only cookies
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) throw new ErrorHandler('User not found', 404);

  res.status(200).json({
    success: true,
    user
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, company, avatar } = req.body;

  const updateFields = {};
  if (name !== undefined) updateFields.name = name.trim();
  if (company !== undefined) updateFields.company = company.trim();
  if (avatar !== undefined) updateFields.avatar = avatar;   // base64 data URL

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) throw new ErrorHandler('User not found', 404);

  res.status(200).json({ success: true, user });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ErrorHandler('User not found with this email', 404);

  const resetToken = crypto.randomBytes(20).toString('hex');

  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${frontendUrl}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message
    });

    res.status(200).json({
      success: true,
      data: 'Email sent'
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ErrorHandler('Email could not be sent', 500);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) throw new ErrorHandler('Invalid token or token expired', 400);

  if (req.body.password !== req.body.confirmPassword) {
    throw new ErrorHandler('Passwords do not match', 400);
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  res.status(200).json({
    success: true,
    token,
    user
  });
});

const setCookie = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ErrorHandler('Token is required', 400);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) throw new ErrorHandler('Invalid token', 400);

  // Set cookie for the CURRENT domain (app.localhost)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days
  });

  res.status(200).json({ success: true, message: 'Cookie set successfully', user: decoded }); // returning decoded user info or just success
});

// @desc   Search users by email prefix (for contributor suggestions)
// @route  GET /api/v1/users/search?q=
// @access Private
const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return res.status(200).json({ success: true, data: [] });

  const users = await User.find({
    _id: { $ne: req.user.id },
    $or: [
      { email: { $regex: q, $options: 'i' } },
      { name: { $regex: q, $options: 'i' } },
    ],
    isVerified: true,
  })
    .select('name email avatar')
    .limit(8);

  res.status(200).json({ success: true, data: users });
});

module.exports = {
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
};


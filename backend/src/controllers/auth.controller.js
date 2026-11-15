const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

const sendToken = (user, code, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(code).json({ token, user });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered.' });
    const verifyToken = crypto.randomBytes(32).toString('hex');
    await User.create({ name, email, password, verifyToken, verifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
    try { await sendVerificationEmail(email, name, verifyToken); } catch (e) { console.error('Email error:', e.message); }
    res.status(201).json({ message: 'Account created! Please check your email to verify.' });
 } catch (err) {
  console.error('REGISTER ERROR:', err);
  res.status(500).json({ message: 'Server error.' });
}
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const registeredUsers = await User.find({}, 'email');
    console.log('REGISTERED EMAILS:', registeredUsers.map(user => user.email));

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    console.log('LOGIN DATABASE CHECK:', {
      database: User.db.name,
      collection: User.collection.name,
      totalUsers: await User.countDocuments(),
      emailReceived: !!normalizedEmail,
      userFound: !!user,
      passwordExists: !!user?.password,
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email first.',
        needsVerification: true,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account suspended.' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    if (!googleId || !email) return res.status(400).json({ message: 'Google credentials missing.' });
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (!user.googleId) { user.googleId = googleId; user.isVerified = true; await user.save({ validateBeforeSave: false }); }
    } else {
      user = await User.create({ name, email, googleId, avatar: avatar || '', isVerified: true });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended.' });
    sendToken(user, 200, res);
  } catch (err) { res.status(500).json({ message: 'Google login failed.' }); }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { verifyToken: req.params.token, verifyExpires: { $gt: Date.now() } },
      { isVerified: true, verifyToken: undefined, verifyExpires: undefined },
      { new: true }
    );
    if (!user) return res.status(400).json({ message: 'Verification link invalid or expired.' });
    res.json({ message: 'Email verified! You can now login.' });
  } catch (err) { res.status(500).json({ message: 'Verification failed.' }); }
};



exports.forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    console.log('FORGOT PASSWORD EMAIL:', email);

    const users = await User.find({}, 'email');
    console.log('DATABASE EMAILS:', users.map(u => u.email));

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    console.log('RESET USER FOUND:', !!user);

    if (!user) {
      return res.json({
        message: 'If this email exists, a reset link was sent.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    user.resetToken = token;
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(email, user.name, token);

    console.log('RESET EMAIL REQUEST COMPLETED');

    return res.json({
      message: 'If this email exists, a reset link was sent.',
    });

  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};



exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ resetToken: req.body.token, resetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Reset link invalid or expired.' });
    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset! You can now login.' });
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (preferences) updates.preferences = preferences;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user, message: 'Profile updated.' });
  } catch (err) { res.status(500).json({ message: 'Update failed.' }); }
};

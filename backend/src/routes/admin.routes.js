const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const User = require('../models/user');
const Chat = require('../models/chat');
const MedicalReport = require('../models/MedicalReport');
const Feedback = require('../models/Feedback');

router.use(protect, adminOnly);

router.get('/stats', async (req, res) => {
  const [users, chats, reports, feedbacks] = await Promise.all([
    User.countDocuments(), Chat.countDocuments(),
    MedicalReport.countDocuments(), Feedback.countDocuments(),
  ]);
  res.json({ users, chats, reports, feedbacks });
});

router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-password');
  res.json({ users });
});

router.patch('/users/:id/suspend', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  res.json({ user, message: 'User suspended.' });
});

router.get('/feedback', async (req, res) => {
  const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ feedbacks });
});

module.exports = router;

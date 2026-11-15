const router = require('express').Router();
const Feedback = require('../models/Feedback');

router.post('/', async (req, res) => {
  try {
    const feedback = await Feedback.create({ ...req.body, user: req.user?._id });
    res.status(201).json({ feedback, message: 'Thank you for your feedback!' });
  } catch (err) { res.status(500).json({ message: 'Error saving feedback.' }); }
});

module.exports = router;

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], ctrl.register);

router.post('/login',           ctrl.login);
router.post('/google',          ctrl.googleLogin);
router.get('/verify/:token',    ctrl.verifyEmail);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password',  ctrl.resetPassword);
router.get('/me',    protect, ctrl.getMe);
router.put('/profile', protect, ctrl.updateProfile);

module.exports = router;

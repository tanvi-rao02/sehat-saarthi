const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, minlength: 8, select: false },
  avatar:        { type: String, default: '' },
  role:          { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified:    { type: Boolean, default: false },
  verifyToken:   String,
  verifyExpires: Date,
  resetToken:    String,
  resetExpires:  Date,
  googleId:      String,
  isActive:      { type: Boolean, default: true },
  preferences: {
    theme:         { type: String, default: 'system' },
    notifications: { type: Boolean, default: true },
  },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);

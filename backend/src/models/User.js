// src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,            // removes extra spaces at ends
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,          // ensures no two users have same email
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --- Pre-save hook: hash password before saving to DB ---
// This runs automatically whenever .save() is called and the password field is new or modified.
UserSchema.pre('save', async function (next) {
  try {
    // 'this' refers to the document being saved
    if (!this.isModified('password')) {
      return next(); // password not changed — skip hashing
    }

    const saltRounds = 10; // cost factor for bcrypt (10 is a reasonable default)
    const hashed = await bcrypt.hash(this.password, saltRounds);
    this.password = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

// --- Instance method: compare given plain password with stored hash ---
// Usage: user.comparePassword('plain123')
UserSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Export the model
const User = mongoose.model('User', UserSchema);
module.exports = User;
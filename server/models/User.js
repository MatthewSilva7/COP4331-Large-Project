const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false }, // For the 5pt rubric requirement
  verificationToken: { type: String }, // To be used for the email link
  major: { type: String },
  courses: [{
      subject: { type: String, uppercase: true }, // "COP"
      number: { type: String }                  // "4331"
  }],
  // NEW: Fields for the Forgot Password logic
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('users', UserSchema);
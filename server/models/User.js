const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false }, // For the 5pt rubric requirement
  verificationToken: { type: String } // To be used for the email link
});

module.exports = mongoose.model('users', UserSchema);

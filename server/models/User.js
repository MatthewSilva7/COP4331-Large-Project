const mongoose = require('mongoose');

// Define course structure
const CourseSchema = new mongoose.Schema({
    subject: { type: String, uppercase: true }, // e.g., "COP"
    number: { type: String }                    // e.g., "4331"
});

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false }, // For the 5pt rubric requirement
  verificationToken: { type: String } // To be used for the email link
  major: { type: String, default: "" },
  courses: [CourseSchema] // Creates an array of course objects
});

module.exports = mongoose.model('users', UserSchema);

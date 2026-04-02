const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    time: {
        type: String, // Keeping as String so the UI can send "0:00 PM" easily
        required: true
    },
    hostName: {
        type: String,
        required: true
    },
    // This links the session to the specific User ID of the person who created it
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
}, { 
    timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
});

module.exports = mongoose.model('Session', SessionSchema);
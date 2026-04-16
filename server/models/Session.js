const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true
    },
    // NEW FIELD
    courseName: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    hostName: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    joinedUserIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Session', SessionSchema);
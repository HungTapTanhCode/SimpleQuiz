const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // admin=false means Author by default; registration may opt in to Admin.
    username: { type: String, default: '', trim: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    admin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: Number, required: true },
    password: { type: String, required: true },
    payment: { type: Boolean, default: false }  // New field added
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
 
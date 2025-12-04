const mongoose = require('mongoose');

const loggerSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true, select: false },
    position: String,
    email: { type: String, required: true },
    phone: String,
    company: String,
    address: String,
    nature: String,
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    resetToken: { type: String, default: null }, 
    resetTokenExpiry: { type: Date, default: null },
    lastVerificationRequest: { type: Date, default: null },
    subscribed: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date, default: null },
    favProjects: [{ type: String, default: [] }],
    subscribedProjects: [{ type: String, default: [] }],
    suspended: { type: Boolean, default: false } 
  }, { timestamps: true });
  
  
  const Logger = mongoose.model("Logger", loggerSchema);
  module.exports = Logger;
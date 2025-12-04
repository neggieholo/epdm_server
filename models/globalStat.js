const mongoose = require("mongoose");

const userLogSchema = new mongoose.Schema({
  date: String, // e.g., '2025-07-14'
  users: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      email: String,
      phone: String,
      company: String,
      address: String,
      position: String,
      nature: String,
      subscribed: Boolean,
      subscriptionExpiry: Date,
      subscribedProjects: [String]
    }
  ]
});

const statsSchema = new mongoose.Schema({
  totalViews: { type: Number, default: 0 },
  siteVisits: { type: Number, default: 0 },
  dailyVisits: {count: { type: Number, default: 0 }, date: { type: String } 
  },
  landingVisits: { type: Number, default: 0 },    // 👈 new field
  landingDailyVisits: {                           // 👈 new field for per-day landing page visits
    date: { type: String },
    count: { type: Number, default: 0 }
  },
  loggedInUsers: [userLogSchema]
});

const GlobalStats = mongoose.model("GlobalStats", statsSchema);

module.exports = GlobalStats;

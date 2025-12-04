const mongoose = require('mongoose');

// ======================
// Admin Schema
// ======================
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
}, { timestamps: true });

module.exports.Admin = mongoose.model('Admin', adminSchema);

// ======================
// About Us
// ======================
const aboutUsSchema = new mongoose.Schema({
  sections: [
    {
      heading: { type: String, default: "" }, 
      message: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports.AboutUs = mongoose.model('AboutUs', aboutUsSchema);

// ======================
// Our Services
// ======================
const servicesSchema = new mongoose.Schema({
  heading: { type: String, required: true }, // main heading
  items: [
    {
      text: { type: String, required: true } // each service item text
    }
  ]
}, { timestamps: true });

module.exports.Services = mongoose.model('Services', servicesSchema);

// ======================
// Our Team
// ======================
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String }, // added image field
  bio: { type: String, required: true },
  order: {
    type: Number, default: 0
  }
}, { timestamps: true });

module.exports.Team = mongoose.model('Team', teamSchema);

// ======================
// Partners
// ======================
const partnersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String, required: true },
  website: { type: String }
}, { timestamps: true });

module.exports.Partners = mongoose.model('Partners', partnersSchema);

// ======================
// News
// ======================
const SectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["paragraph", "image", "video"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: false, // optional
    default: "",
  },
});

const NewsSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    sections: [SectionSchema], // order preserved
  },
  { timestamps: true }
);

module.exports.News = mongoose.model("News", NewsSchema);

// ======================
// Project Interview
// ======================
const projectInterviewSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    sections: [SectionSchema], // order preserved
  },
  { timestamps: true }
);

module.exports.ProjectInterview = mongoose.model('ProjectInterview', projectInterviewSchema);

// ======================
// Social Links
// ======================
const socialLinksSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ["x", "facebook", "linkedin", "instagram", "snapchat", "youtube", "tiktok"] // extendable
  },
  url: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports.SocialLinks = mongoose.model('SocialLinks', socialLinksSchema);

// ======================
// Subscription
// ======================
const subscriptionSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports.Subscription = mongoose.model("Subscription", subscriptionSchema);
// ======================
// Contact
// ======================
const contactSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  address: { type: String },
  phones: { type: [String] },
  email: { type: String },
  mapEmbedUrl: { type: String }
}, { timestamps: true });

module.exports.Contact = mongoose.model('Contact', contactSchema);

const TermsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["terms", "privacy"], // extendable if more doc types later
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports.Terms = mongoose.model("Terms", TermsSchema);

const newsLinkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  order: Number
}, { timestamps: true });

module.exports.NewsLink = mongoose.model("NewsLink", newsLinkSchema);

require("dotenv").config();
const path = require("path");
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
    cloud_name: "diubaoqcr",
    api_key: "962197146245963",
    api_secret: process.env.CLOUDINARYAPISECRET,
});

// Local video path (change this)
const videoPath = path.resolve("C:\\Users\\drags\\Downloads\\SECOND REPORT.mp4");

async function uploadVideo() {
  try {
    const result = await cloudinary.uploader.upload(videoPath, {
      resource_type: "video",
      folder: "test_videos",
    });

    console.log("Upload successful");
    console.log("Public ID:", result.public_id);
    console.log("Secure URL:", result.secure_url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

uploadVideo();

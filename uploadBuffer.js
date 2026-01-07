require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
    cloud_name: "diubaoqcr",
    api_key: "962197146245963",
    api_secret: process.env.CLOUDINARYAPISECRET,
});

function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}
module.exports = { uploadBufferToCloudinary };
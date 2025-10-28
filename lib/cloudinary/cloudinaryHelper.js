// helpers/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dwebxmktr",
  api_key: "988681166781262",
  api_secret: "f4gUgqo7htBtD3eOGhfirdKd8kA",
});

// Disk-based upload helper
export const uploadFile = async (filePath, filename) => {
  const res = await cloudinary.uploader.upload(filePath, {
    resource_type: "auto",
    public_id: filename,
    quality: "auto:eco",
    allowed_formats: [
      "jpg","jpeg","png","jfif","avif",
      "pdf","mp4","mov","avi","webm","mkv"
    ],
  });
  return res;
};

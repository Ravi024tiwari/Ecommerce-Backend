import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/Cloudinary.js";

// cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Ecommerce",   // cloud folder
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// multer upload middleware
const upload = multer({ storage });

export default upload;//here we use this to upload file or photos by using multar

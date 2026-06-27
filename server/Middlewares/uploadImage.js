import multer from "multer";
import { v2 as cloudinary } from "cloudinary"; 
import { CloudinaryStorage } from "multer-storage-cloudinary";
import ApiError from "../Utils/apiError.js";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "tech_gadgets_products", 
        allowed_formats: ["jpg", "jpeg", "png", "webp"], 
    },
});

const imageUpload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 1024 * 1024 * 5 },  
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            cb(new ApiError("Only images (.png, .jpg, .jpeg) are allowed!", 400), false);
        }
    }
});

export default imageUpload;
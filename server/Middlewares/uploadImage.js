import multer from "multer";
import path from 'path';
import ApiError from "../Utils/apiError.js";

const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname); 
        cb(null, `${Date.now()}${extension}`);
    }
});

const imageUpload = multer({
    storage: imageStorage,
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
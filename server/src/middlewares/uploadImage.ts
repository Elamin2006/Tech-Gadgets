import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import ApiError from "../utils/apiError.js";
import { cloudinary } from "../services/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tech_gadgets",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const uploadImage = multer({
  storage,

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          "Only image files are allowed.",
          400,
        ),
      );
    }
  },
});

export default uploadImage;
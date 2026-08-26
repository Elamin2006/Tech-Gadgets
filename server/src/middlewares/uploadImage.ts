import multer from "multer";

import ApiError from "../utils/apiError.js";

const storage = multer.memoryStorage();

const uploadImage = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
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
          "Only JPEG, PNG and WebP images are allowed.",
          400,
        ),
      );
    }
  },
});

export default uploadImage;
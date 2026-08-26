import cloudinary from "../config/cloudinary.js";

export interface UploadedCloudinaryImage {
  publicId: string;
  url: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
): Promise<UploadedCloudinaryImage> => {
  if (!file.buffer) {
    throw new Error(
      "File buffer is unavailable for Cloudinary upload",
    );
  }

  const result = await new Promise<{
    public_id: string;
    secure_url: string;
  }>((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(
              new Error(
                "Cloudinary upload returned no result",
              ),
            );
            return;
          }

          resolve(result);
        },
      );

    uploadStream.end(file.buffer);
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
  };
};

export const deleteFromCloudinary = async (
  publicId: string,
): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export { cloudinary };
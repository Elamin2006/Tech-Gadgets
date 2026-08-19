import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl.includes("cloudinary")) {
    return;
  }

  const urlParts = imageUrl.split("/");

  const folderName = urlParts[urlParts.length - 2];
  const fileNameWithExtension = urlParts[urlParts.length - 1];

  const fileName = fileNameWithExtension.split(".")[0];

  const publicId = `${folderName}/${fileName}`;

  await cloudinary.uploader.destroy(publicId);
};

export { cloudinary };
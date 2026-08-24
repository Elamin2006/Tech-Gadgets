import dotenv from "dotenv";

dotenv.config();

const requiredEnvVariables = ["MONGO_URI", "ACCESS_TOKEN_SECRET"];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(`CRITICAL: ${variable} is missing in .env file`);
  }
}

const config = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  MONGO_URL: process.env.MONGO_URI,

  //JWT
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,

  //Email
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
  EMAIL: process.env.EMAIL,
  EMAIL_PASSWORD:
    process.env.USERPASS ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.APP_PASSWORD,

  CLIENT_URLS: process.env.CLIENT_URLS || "",

  //Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

} as const;

export default config;
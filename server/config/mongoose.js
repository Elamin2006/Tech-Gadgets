import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();    

let url = process.env.MONGO_URI;

export async function DBConnection() {
  try {
    await mongoose.connect(url);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Error in connecting to database", error);
    throw error;
  }
}

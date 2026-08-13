import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import type { UserRole } from "../types/auth.types.js";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  role?: UserRole;
  isBanned?: boolean;

  createdAt?: Date;

  passwordResetCode?: string;
  passwordResetExpires?: Date;
  passwordResetVerified?: boolean;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "First name must be at least 3 characters long"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Last name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    passwordResetCode: { type: String },
    passwordResetExpires: { type: Date },
    passwordResetVerified: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("name").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
const User = mongoose.model<IUser>("User", userSchema);

export default User;

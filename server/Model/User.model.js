import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
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
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  user.password = await bcrypt.hash(user.password, 10);
  next();
});
const User = mongoose.model("User", userSchema);

export default User;

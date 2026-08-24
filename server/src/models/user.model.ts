import mongoose, { type Model } from "mongoose";
import bcrypt from "bcryptjs";

import type { UserRole } from "../types/auth.types.js";

export interface IAddress {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface IUser {
  username: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  addresses?: IAddress[];
  wishlist?: mongoose.Types.ObjectId[];
  isVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(enteredPassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const addressSchema = new mongoose.Schema<IAddress>(
  {
    fullName: {
      type: String,
    },

    phone: {
      type: String,
    },

    country: {
      type: String,
    },

    city: {
      type: String,
    },

    address: {
      type: String,
    },

    postalCode: {
      type: String,
    },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    phone: {
      type: String,
    },

    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/no625vlt/image/upload/v1785078789/Screenshot_2026-07-26_181048_mzehzd.png",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    addresses: [addressSchema],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
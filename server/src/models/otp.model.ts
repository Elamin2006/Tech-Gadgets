import mongoose, { type Model } from "mongoose";

export interface IOTPUserData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface IOTP {
  email: string;
  otp: string;
  expiresAt: Date;
  userData?: IOTPUserData | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type OTPModel = Model<IOTP>;

const otpSchema = new mongoose.Schema<IOTP>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },

    otp: {
      type: String,
      required: [true, "OTP is required"],
    },

    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },

    userData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

otpSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

const OTP = mongoose.model<IOTP>("OTP", otpSchema);

export default OTP;
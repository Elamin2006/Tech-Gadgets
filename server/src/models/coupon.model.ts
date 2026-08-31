import mongoose, { type HydratedDocument } from "mongoose";

export type CouponType = "percentage" | "fixed";

export interface ICoupon {
  code: string;
  type: CouponType;
  value: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  appliesToDiscountedProducts: boolean;
  isActive: boolean;
  expiresAt?: Date;
  usageLimit?: number;
  usedCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const couponSchema = new mongoose.Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Coupon type is required"],
    },
    value: {
      type: Number,
      required: [true, "Coupon value is required"],
      min: [0, "Coupon value cannot be negative"],
    },
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    maximumDiscount: {
      type: Number,
      min: [0, "Maximum discount cannot be negative"],
    },
    appliesToDiscountedProducts: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: Date,
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
  },
  { timestamps: true },
);

couponSchema.pre("validate", function (this: HydratedDocument<ICoupon>, next) {
  if (this.type === "percentage" && this.value > 100) {
    this.invalidate("value", "Percentage coupon cannot exceed 100%");
  }

  if (
    this.usageLimit !== undefined &&
    this.usedCount > this.usageLimit
  ) {
    this.invalidate("usedCount", "Used count cannot exceed usage limit");
  }

  next();
});

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;

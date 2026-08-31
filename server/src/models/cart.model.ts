import mongoose from "mongoose";

export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart {
  userId: mongoose.Types.ObjectId;
  cartItems: ICartItem[];
  subtotal: number;
  couponId?: mongoose.Types.ObjectId;
  couponCode?: string;
  couponDiscount: number;
  totalCartPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const cartItemSchema = new mongoose.Schema<ICartItem>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Cart item must have a product ID"],
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, "Quantity cannot be less than 1"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price cannot be negative"],
    },
  },
  { _id: true },
);

const cartSchema = new mongoose.Schema<ICart>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cart must belong to a user"],
      unique: true,
    },
    cartItems: {
      type: [cartItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    couponDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCartPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;

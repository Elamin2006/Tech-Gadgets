import mongoose, { type Model } from "mongoose";

export type PaymentMethod = "cash" | "card";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type OrderStatus = "pending" | "completed" | "canceled";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  details: string;
  phone: string;
  city: string;
}

export interface IOrder {
  userId: mongoose.Types.ObjectId;

  orderItems: IOrderItem[];

  shippingAddress: IShippingAddress;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;

  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  totalOrderPrice: number;
  status: OrderStatus;
  isPaid: boolean;
  paidAt?: Date;

  isDelivered: boolean;
  deliveredAt?: Date;

  cancelledAt?: Date;

  customerNote?: string;
  adminNote?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

type OrderModel = Model<IOrder>;

const orderItemSchema = new mongoose.Schema<IOrderItem>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
  },
  {
    _id: false,
  },
);

const shippingAddressSchema = new mongoose.Schema<IShippingAddress>(
  {
    details: {
      type: String,
      required: [true, "Shipping details are required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema<IOrder, OrderModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },

    orderItems: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],

      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    transactionId: {
      type: String,
      trim: true,
      default: null,
    },

    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },

    shippingFee: {
      type: Number,
      default: 0,
      min: [0, "Shipping fee cannot be negative"],
    },

    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },

    totalOrderPrice: {
      type: Number,
      required: [true, "Total order price is required"],
      min: [0, "Total order price cannot be negative"],
    },

    status: {
      type: String,
      enum: ["pending", "completed", "canceled"],
      default: "pending",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },

    customerNote: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Customer note cannot exceed 1000 characters",
      ],
      default: "",
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Admin note cannot exceed 1000 characters",
      ],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model<IOrder, OrderModel>(
  "Order",
  orderSchema,
);

export default Order;
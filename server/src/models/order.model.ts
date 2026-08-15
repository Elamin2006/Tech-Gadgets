import mongoose from "mongoose";

export type PaymentMethod = "cash" | "card";

export type OrderStatus = "pending" | "completed" | "canceled";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
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
  totalOrderPrice: number;
  paymentMethod?: PaymentMethod;
  isPaid?: boolean;
  paidAt?: Date;
  isDelivered?: boolean;
  deliveredAt?: Date;
  status?: OrderStatus;
}
//
const orderSchema = new mongoose.Schema<IOrder>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Order must belong to a user"]
        },
        orderItems: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                price: {
                    type: Number, 
                    required: true
                }
            }
        ],
        shippingAddress: {
            details: { type: String, required: [true, "Shipping details are required"] },
            phone: { type: String, required: [true, "Phone number is required"] },
            city: { type: String, required: [true, "City is required"] }
        },
        totalOrderPrice: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "card"],
            default: "cash"
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paidAt: {
            type: Date
        },
        isDelivered: {
            type: Boolean,
            default: false
        },
        deliveredAt: {
            type: Date
        },
        status: {
            type: String,
            enum: ["pending", "completed", "canceled"],
            default: "pending"
        }
    },
    { timestamps: true } 
);

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
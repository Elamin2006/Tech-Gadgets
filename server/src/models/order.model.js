import mongoose from "mongoose";
//
const orderSchema = new mongoose.Schema(
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

const Order = mongoose.model('Order', orderSchema);
export default Order;
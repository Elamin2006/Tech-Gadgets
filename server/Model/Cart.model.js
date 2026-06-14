import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Cart must belong to a user"],
            unique: true 
        },

        cartItems: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: [true, "Cart item must have a product ID"]
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: [1, "Quantity cannot be less than 1"]
                },
                price: {
                    type: Number, 
                    required: [true, "Product price is required"]
                }
            }
        ],
        totalCartPrice: {
            type: Number,
            default: 0
        },
        totalPriceAfterDiscount: {
            type: Number,
            default: undefined 
        }
    },
    { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
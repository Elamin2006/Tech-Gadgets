import mongoose from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity?: number;
  price: number;
}

export interface ICart {
  userId: mongoose.Types.ObjectId;
  cartItems: ICartItem[];
  totalCartPrice?: number;
}

const cartSchema = new mongoose.Schema<ICart>(
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
    },
    { timestamps: true }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
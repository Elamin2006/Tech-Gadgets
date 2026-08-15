import mongoose from "mongoose";

export interface IProduct {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  discount?: number;
  quantity: number;
  categoryId?: mongoose.Types.ObjectId;
}

const productSchema = new mongoose.Schema<IProduct>({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: [true, "Product name is required"],
        maxlength: [100, "Product name cannot exceed 100 characters"]
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Product price cannot be negative"]
    },
    image: {
        type: String,
        required: [true, "Product image URL is required"],
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be less than 0"],
        max: [100, "Discount cannot exceed 100%"]
    },
    quantity: {
        type: Number,
        required: [true, "Product quantity is required"],
        default: 1,
        min: [0, "Product quantity cannot be negative"]
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }

}
    , { timestamps: true });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
import mongoose from "mongoose";

export interface ICategory {
  userId?: mongoose.Types.ObjectId;
  name: string;
}

const categorySchema = new mongoose.Schema<ICategory>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: true, 
            trim: true,
            lowercase: true,
            maxlength: [32, "Category name is too long"]
        }

    },
    { timestamps: true }
);

const Category = mongoose.model<ICategory>("Category", categorySchema);
export default Category;
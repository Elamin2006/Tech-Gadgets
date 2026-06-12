import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: true, // لمنع تكرار اسم الفئة (مثل: electronics, clothing)
            trim: true,
            lowercase: true,
            maxlength: [32, "Category name is too long"]
        }

    },
    { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
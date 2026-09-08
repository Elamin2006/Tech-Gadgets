import mongoose, { type Model } from "mongoose";

export interface IWishlist {
  userId: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

type WishlistModel = Model<IWishlist>;

const wishlistSchema = new mongoose.Schema<
  IWishlist,
  WishlistModel
>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Wishlist must belong to a user"],
      unique: true,
      index: true,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Wishlist = mongoose.model<IWishlist, WishlistModel>(
  "Wishlist",
  wishlistSchema,
);

export default Wishlist;
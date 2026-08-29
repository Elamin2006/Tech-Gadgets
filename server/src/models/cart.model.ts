import mongoose, {
  type HydratedDocument,
  type Model,
} from "mongoose";

export type CouponDiscountType =
  | "percentage"
  | "fixed";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ICartCoupon {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
}

export interface ICart {
  userId: mongoose.Types.ObjectId;
  cartItems: ICartItem[];
  coupon: ICartCoupon | null;
  createdAt?: Date;
  updatedAt?: Date;
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
}

export interface ICartVirtuals {
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
}

export type CartDocument = HydratedDocument<
  ICart,
  ICartVirtuals
>;

type CartModel = Model<ICart>;

const cartItemSchema =
  new mongoose.Schema<ICartItem>(
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [
          true,
          "Product is required",
        ],
      },

      name: {
        type: String,
        required: [
          true,
          "Product name is required",
        ],
        trim: true,
      },

      image: {
        type: String,
        required: [
          true,
          "Product image is required",
        ],
        trim: true,
      },

      price: {
        type: Number,
        required: [
          true,
          "Product price is required",
        ],
        min: [
          0,
          "Product price cannot be negative",
        ],
      },

      quantity: {
        type: Number,
        required: [
          true,
          "Quantity is required",
        ],
        default: 1,
        min: [
          1,
          "Quantity must be at least 1",
        ],
      },
    },
    {
      _id: false,
    },
  );

const couponSchema =
  new mongoose.Schema<ICartCoupon>(
    {
      code: {
        type: String,
        uppercase: true,
        trim: true,
      },

      discountType: {
        type: String,
        enum: [
          "percentage",
          "fixed",
        ],
      },

      discountValue: {
        type: Number,
        default: 0,
        min: [
          0,
          "Discount value cannot be negative",
        ],
      },
    },
    {
      _id: false,
    },
  );

const cartSchema =
  new mongoose.Schema<
    ICart,
    CartModel,
    object,
    object,
    ICartVirtuals
  >(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [
          true,
          "Cart must belong to a user",
        ],
        unique: true,
      },

      cartItems: {
        type: [cartItemSchema],
        default: [],
      },

      coupon: {
        type: couponSchema,
        default: null,
      },
    },
    {
      timestamps: true,

      toJSON: {
        virtuals: true,
      },

      toObject: {
        virtuals: true,
      },
    },
  );

cartSchema.virtual("subtotal").get(
  function (this: CartDocument) {
    return this.cartItems.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0,
    );
  },
);

cartSchema
  .virtual("discountAmount")
  .get(function (this: CartDocument) {
    if (!this.coupon) {
      return 0;
    }

    if (this.subtotal <= 0) {
      return 0;
    }

    if (
      this.coupon.discountType ===
      "percentage"
    ) {
      return Math.min(
        this.subtotal,
        (this.subtotal *
          this.coupon.discountValue) /
          100,
      );
    }

    if (
      this.coupon.discountType ===
      "fixed"
    ) {
      return Math.min(
        this.subtotal,
        this.coupon.discountValue,
      );
    }

    return 0;
  });

cartSchema.virtual("total").get(
  function (this: CartDocument) {
    return Math.max(
      0,
      this.subtotal -
        this.discountAmount,
    );
  },
);

cartSchema.virtual("itemCount").get(
  function (this: CartDocument) {
    return this.cartItems.reduce(
      (count, item) =>
        count + item.quantity,
      0,
    );
  },
);

const Cart = mongoose.model<ICart>(
  "Cart",
  cartSchema,
);

export default Cart;
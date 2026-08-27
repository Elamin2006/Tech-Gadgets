import mongoose, {
  type HydratedDocument,
  type Model,
} from "mongoose";
import slugify from "slugify";

export interface IProductImage {
  publicId: string;
  url: string;
}

export interface IProductReview {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  username: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProduct {
  createdBy: mongoose.Types.ObjectId;

  name: string;
  slug?: string;

  shortDescription: string;
  description: string;

  price: number;
  discountPrice?: number;

  stock: number;
  sku?: string;

  images: IProductImage[];

  categoryId: mongoose.Types.ObjectId;
  subcategory?: string;

  brand?: string;
  tags: string[];

  reviews: IProductReview[];

  averageRating: number;
  numReviews: number;

  featured: boolean;
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductMethods {
  calcAverageRating(): void;
}

type ProductModel = Model<IProduct, object, IProductMethods>;

const imageSchema = new mongoose.Schema<IProductImage>(
  {
    publicId: {
      type: String,
      required: [true, "Image public ID is required"],
    },

    url: {
      type: String,
      required: [true, "Image URL is required"],
    },
  },
  {
    _id: false,
  },
);

const reviewSchema = new mongoose.Schema<IProductReview>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const productSchema = new mongoose.Schema<
  IProduct,
  ProductModel,
  IProductMethods
>(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product creator is required"],
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [
        200,
        "Product name cannot exceed 200 characters",
      ],
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [
        500,
        "Short description cannot exceed 500 characters",
      ],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: [0, "Discount price cannot be negative"],

      validate: {
        validator: function (
          this: HydratedDocument<IProduct>,
          value: number,
        ) {
          return value <= this.price;
        },

        message:
          "Discount price cannot exceed product price",
      },
    },

    stock: {
      type: Number,
      required: [true, "Stock is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    images: {
      type: [imageSchema],
      required: [true, "At least one product image is required"],

      validate: {
        validator: (images: IProductImage[]) =>
          images.length >= 1,

        message:
          "At least one product image is required",
      },
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    subcategory: {
      type: String,
      trim: true,
      lowercase: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    reviews: [reviewSchema],

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  },
);

productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

productSchema.methods.calcAverageRating = function () {
  if (!this.reviews || this.reviews.length === 0) {
    this.averageRating = 0;
    this.numReviews = 0;
    return;
  }

  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  );

  this.averageRating = Number(
    (totalRating / this.reviews.length).toFixed(1),
  );

  this.numReviews = this.reviews.length;
};

// Text search
productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
});

// Filtering / sorting indexes
productSchema.index({ categoryId: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model<
  IProduct,
  ProductModel
>("Product", productSchema);

export default Product;
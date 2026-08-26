import ApiError from "./apiError.js";

export type SortQuery = Record<string, 1 | -1>;

export interface PaginationResult {
  currentPage: number;
  limitPerPage: number;
  skip: number;
}

/**
 * Build product sorting query.
 */
export const getSortQuery = (
  sort?: string,
): SortQuery => {
  const sortOptions: Record<
    string,
    SortQuery
  > = {
    price_asc: {
      price: 1,
    },

    price_desc: {
      price: -1,
    },

    rating: {
      averageRating: -1,
    },

    popular: {
      numReviews: -1,
    },

    oldest: {
      createdAt: 1,
    },
  };

  return (
    sortOptions[sort ?? ""] ?? {
      createdAt: -1,
    }
  );
};

/**
 * Calculate pagination values.
 */
export const getPagination = (
  page: string | number = 1,
  limit: string | number = 10,
): PaginationResult => {
  const parsedPage =
    typeof page === "number"
      ? page
      : Number.parseInt(page, 10);

  const parsedLimit =
    typeof limit === "number"
      ? limit
      : Number.parseInt(limit, 10);

  const currentPage = Number.isFinite(parsedPage)
    ? Math.max(1, parsedPage)
    : 1;

  const limitPerPage = Number.isFinite(parsedLimit)
    ? Math.max(1, parsedLimit)
    : 10;

  return {
    currentPage,
    limitPerPage,
    skip:
      (currentPage - 1) * limitPerPage,
  };
};

/**
 * Add a case-insensitive regex filter.
 */
export const addRegexFilter = (
  filter: Record<string, unknown>,
  field: string,
  value?: string,
): void => {
  if (!value) {
    return;
  }

  filter[field] = {
    $regex: value,
    $options: "i",
  };
};

/**
 * Add tags filter.
 */
export const addTagsFilter = (
  filter: Record<string, unknown>,
  tags?: string,
): void => {
  if (!tags) {
    return;
  }

  const parsedTags = tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  if (parsedTags.length === 0) {
    return;
  }

  filter.tags = {
    $in: parsedTags,
  };
};

/**
 * Add price range filter.
 */
export const addPriceFilter = (
  filter: Record<string, unknown>,
  minPrice?: string,
  maxPrice?: string,
): void => {
  if (!minPrice && !maxPrice) {
    return;
  }

  const priceFilter: {
    $gte?: number;
    $lte?: number;
  } = {};

  if (minPrice) {
    const value = Number(minPrice);

    if (!Number.isFinite(value)) {
      throw new ApiError(
        "minPrice must be a valid number",
        400,
      );
    }

    priceFilter.$gte = value;
  }

  if (maxPrice) {
    const value = Number(maxPrice);

    if (!Number.isFinite(value)) {
      throw new ApiError(
        "maxPrice must be a valid number",
        400,
      );
    }

    priceFilter.$lte = value;
  }

  filter.price = priceFilter;
};

/**
 * Find a cart item by product ID.
 */
export const findCartItemIndex = (
  cart: {
    cartItems: Array<{
      productId: {
        toString(): string;
      };
    }>;
  },
  productId: string,
): number => {
  return cart.cartItems.findIndex(
    (item) =>
      item.productId.toString() === productId,
  );
};

/**
 * Update product stock when cart/order quantity changes.
 */
export const updateProductStock = (
  product: {
    stock: number;
  },
  oldQuantity: number,
  newQuantity: number,
): void => {
  const difference =
    newQuantity - oldQuantity;

  if (difference > 0) {
    if (product.stock < difference) {
      throw new ApiError(
        "Not enough stock available.",
        400,
      );
    }

    product.stock -= difference;
  }

  if (difference < 0) {
    product.stock += Math.abs(difference);
  }
};

/**
 * Orders grouped by status.
 */
export const getOrdersByStatusPipeline = () => [
  {
    $group: {
      _id: "$status",
      count: {
        $sum: 1,
      },
    },
  },
];

/**
 * Revenue statistics pipeline.
 */
export const getRevenueStatsPipeline = (
  startOfThisMonth: Date,
  startOfLastMonth: Date,
  endOfLastMonth: Date,
) => [
  {
    $match: {
      paymentStatus: "paid",

      status: {
        $nin: [
          "cancelled",
          "returned",
        ],
      },
    },
  },

  {
    $group: {
      _id: null,

      totalRevenue: {
        $sum: "$totalOrderPrice",
      },

      thisMonthRevenue: {
        $sum: {
          $cond: [
            {
              $gte: [
                "$createdAt",
                startOfThisMonth,
              ],
            },
            "$totalOrderPrice",
            0,
          ],
        },
      },

      lastMonthRevenue: {
        $sum: {
          $cond: [
            {
              $and: [
                {
                  $gte: [
                    "$createdAt",
                    startOfLastMonth,
                  ],
                },

                {
                  $lte: [
                    "$createdAt",
                    endOfLastMonth,
                  ],
                },
              ],
            },

            "$totalOrderPrice",
            0,
          ],
        },
      },
    },
  },
];

/**
 * Top-selling products.
 */
export const getTopProductsPipeline = () => [
  {
    $match: {
      paymentStatus: "paid",

      status: {
        $nin: [
          "cancelled",
          "returned",
        ],
      },
    },
  },

  {
    $unwind: "$orderItems",
  },

  {
    $group: {
      _id: "$orderItems.productId",

      totalSold: {
        $sum: "$orderItems.quantity",
      },

      revenue: {
        $sum: {
          $multiply: [
            "$orderItems.quantity",
            "$orderItems.price",
          ],
        },
      },
    },
  },

  {
    $sort: {
      totalSold: -1,
    },
  },

  {
    $limit: 5,
  },

  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "productDetails",
    },
  },

  {
    $unwind: "$productDetails",
  },

  {
    $project: {
      _id: "$productDetails._id",
      name: "$productDetails.name",
      image: {
        $arrayElemAt: [
          "$productDetails.images",
          0,
        ],
      },
      totalSold: 1,
      revenue: 1,
    },
  },
];

/**
 * Daily revenue for the last seven days.
 */
export const getDailyRevenuePipeline = (
  sevenDaysAgo: Date,
) => [
  {
    $match: {
      paymentStatus: "paid",

      status: {
        $nin: [
          "cancelled",
          "returned",
        ],
      },

      createdAt: {
        $gte: sevenDaysAgo,
      },
    },
  },

  {
    $group: {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$createdAt",
        },
      },

      revenue: {
        $sum: "$totalOrderPrice",
      },

      orders: {
        $sum: 1,
      },
    },
  },

  {
    $sort: {
      _id: 1,
    },
  },
];
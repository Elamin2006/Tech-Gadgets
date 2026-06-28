import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItemToCart } from "../../store/slices/cartSlice";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const imageUrl =
    product.image || "https://placehold.co/600x400/171c20/dee3e8?text=No+Image";

  const title = product.name || "Tactical Hardware";
  const description =
    product.description || "No specifications provided for this elite item.";

  const hasDiscount = product.discount > 0;
  const originalPrice = product.price || 0;
  const discountedPrice = hasDiscount
    ? originalPrice - originalPrice * (product.discount / 100)
    : originalPrice;

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to manage your live cart! ");
      navigate("/login");
      return;
    }

    dispatch(addItemToCart({ productId: product._id, quantity: 1 }));
  };

  return (
    <div className="col-lg-4 col-md-6 col-sm-6 col-12 mb-4">
      <div className="card h-100 elite-product-card position-relative">
        {hasDiscount && (
          <span className="elite-discount-badge">{product.discount}% OFF</span>
        )}

        <div className="elite-card-img-wrapper">
          <img
            loading="lazy"
            src={imageUrl}
            className="card-img-top elite-card-img"
            alt={title}
            onError={(e) => {
              e.target.src =
                "https://placehold.co/600x400/171c20/dee3e8?text=Image+Not+Found";
            }}
          />
        </div>

        <div className="card-body d-flex flex-column text-start">
          <h5 className="elite-card-title mb-2">
            {title.length > 25 ? `${title.substring(0, 25)}...` : title}
          </h5>
          <p className="elite-card-text flex-grow-1">
            {description.length > 85
              ? `${description.substring(0, 85)}...`
              : description}
          </p>

          <div className="elite-price-tag lead mb-3 d-flex align-items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-success font-weight-bold">
                  ${discountedPrice.toLocaleString()}
                </span>
                <span className=" text-decoration-line-through fs-6">
                  ${originalPrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span>${originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>

        <div className="card-footer bg-transparent border-0 p-3 pt-0 d-flex gap-2">
          <Link
            to={`/product/${product._id?.$oid || product._id || product.id}`}
            className="btn btn-elite-outline w-50"
          >
            Details
          </Link>
          <button
            className="btn btn-elite-primary w-50"
            onClick={handleAddToCart}
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}

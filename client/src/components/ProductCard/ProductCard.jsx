import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({ product, isDiscountPage }) {
  const SERVER_URL = "https://tech-gadgets-server-kappa.vercel.app";
  
  let imageUrl = "https://placehold.co/600x400/171c20/dee3e8?text=No+Image";
  
  if (product.image) {
    if (product.image.startsWith("http")) {
      imageUrl = product.image;
    } else if (product.image.startsWith("/uploads") || product.image.startsWith("/api/images")) {
      
      imageUrl = "https://placehold.co/600x400/171c20/dee3e8?text=Legacy+Asset";
    } else {
      imageUrl = `${SERVER_URL}${product.image}`;
    }
  }

  const title = product.name || product.title || "Tactical Hardware";
  const description = product.description || "No specifications provided for this elite item.";

  return (
    <div className="col-lg-4 col-md-6 col-sm-6 col-12 mb-4">
      <div className="card h-100 elite-product-card position-relative">
        
        {product.discount > 0 && isDiscountPage ? (
          <span className="elite-discount-badge">{product.discount}% OFF</span>
        ) : null}

        <div className="elite-card-img-wrapper">
          <img
            loading="lazy"
            src={imageUrl}
            className="card-img-top elite-card-img"
            alt={title}
            onError={(e) => {
              e.target.src = "https://placehold.co/600x400/171c20/dee3e8?text=Image+Not+Found";
            }}
          />
        </div>

        <div className="card-body d-flex flex-column text-start">
          <h5 className="elite-card-title mb-2">
            {title.length > 25 ? `${title.substring(0, 25)}...` : title}
          </h5>
          <p className="elite-card-text flex-grow-1">
            {description.length > 85 ? `${description.substring(0, 85)}...` : description}
          </p>
          
          <div className="elite-price-tag lead mb-3">
            ${product.price ? product.price.toLocaleString() : "0"}
          </div>
        </div>

        <div className="card-footer bg-transparent border-0 p-3 pt-0 d-flex gap-2">
          <Link
            to={`/product/${product._id?.$oid || product._id || product.id}`}
            className="btn btn-elite-outline w-50"
          >
            Details
          </Link>
          <button className="btn btn-elite-primary w-50">
            Add To Cart
          </button>
        </div>

      </div>
    </div>
  );
}
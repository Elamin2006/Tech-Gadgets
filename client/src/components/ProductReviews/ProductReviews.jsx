import { useState } from "react";
import { Container } from "react-bootstrap";
import "./ProductReviews.css";

const ProductReviews = ({ selectedProduct }) => {
  const [listSelected, setListSelected] = useState("desc");

  const reviewsList = selectedProduct?.reviews || [];
  const description =
    selectedProduct?.description || "No specifications provided.";

  return (
    <section className="product-reviews-section py-5 text-start bg-dark text-white">
      <Container>
        <ul className="nav-reviews-tabs d-flex gap-4 list-unstyled border-bottom border-secondary pb-2 mb-4">
          <li
            className={`review-tab-item fw-bold fs-5 ${listSelected === "desc" ? "active-tab" : "inactive-tab"}`}
            onClick={() => setListSelected("desc")}
          >
            Description
          </li>
          <li
            className={`review-tab-item fw-bold fs-5 ${listSelected === "rev" ? "active-tab" : "inactive-tab"}`}
            onClick={() => setListSelected("rev")}
          >
            Reviews ({reviewsList.length})
          </li>
        </ul>

        {listSelected === "desc" ? (
          <div className="tab-content-panel p-4 rounded-3 text-muted elite-desc-text">
            <p className="lead m-0">{description}</p>
          </div>
        ) : (
          <div className="rates-wrapper d-flex flex-column gap-3">
            {reviewsList.length > 0 ? (
              reviewsList.map((rate, index) => (
                <div
                  className="rate-comment-card p-4 rounded-3 border border-secondary"
                  key={rate.id || index}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-info fs-6">
                      @{rate.user || rate.username || "Anonymous_Operator"}
                    </span>
                    <span className="badge bg-warning text-dark fw-bold px-2 py-1">
                      ⭐ {rate.rating} / 5
                    </span>
                  </div>

                  <p className="m-0  review-comment-body">
                    {rate.comment ||
                      rate.text ||
                      "Verified system logs synchronization successful."}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted rounded-3 border border-dashed border-secondary">
                No active deployment reviews recorded for this asset.
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
};

export default ProductReviews;

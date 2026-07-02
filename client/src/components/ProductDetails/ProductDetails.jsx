import { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { addItemToCart } from "../../store/slices/cartSlice";
import "./ProductDetails.css";

const ProductDetails = ({ selectedProduct }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const productId = selectedProduct?._id;
  const title = selectedProduct?.name || "Premium Gadget";
  const description =
    selectedProduct?.description || "No specifications provided.";
  const imageUrl =
    selectedProduct?.image ||
    "https://placehold.co/600x400/171c20/dee3e8?text=No+Image";

  const originalPrice = selectedProduct?.price || 0;
  const discountPercentage = selectedProduct?.discount || 0;
  const hasDiscount = discountPercentage > 0;

  const discountedPrice = hasDiscount
    ? originalPrice - originalPrice * (discountPercentage / 100)
    : originalPrice;

  const categoryName = selectedProduct?.categoryId?.name || "Tech";
  const stockAvailable = selectedProduct?.quantity || 0;
  const handleIncrement = () => {
    if (quantity < stockAvailable) {
      setQuantity((q) => q + 1);
    } else {
      toast.warn(
        `Only ${stockAvailable} units available in operational stock!`,
      );
    }
  };
  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));

  const handleDeployToCart = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Authentication required! Please login first.");
      navigate("/login");
      return;
    }

    if (stockAvailable === 0) {
      toast.error("Item is currently out of stock!");
      return;
    }

    dispatch(addItemToCart({ productId: productId, quantity: quantity }));
    toast.success(
      `${title} (${quantity} units) added to cart successfully! `,
    );
  };

  return (
    <section className="product-details-section py-3  text-start text-white bg-dark">
      <Container>
        <Row className="justify-content-center align-items-center g-5">
          <Col md={6} className="text-center position-relative">
            <div className="details-img-wrapper p-4 rounded-3 position-relative">
              {hasDiscount && (
                <span className="elite-discount-badge-details">
                  {discountPercentage}% OFF
                </span>
              )}
              <img
                loading="lazy"
                src={imageUrl}
                alt={title}
                className="img-fluid rounded-3 target-spec-img"
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/600x400/171c20/dee3e8?text=Image+Not+Found";
                }}
              />
            </div>
          </Col>

          <Col md={6}>
            <div className="details-content-panel">
              <span className="badge bg-info text-dark mb-3 text-uppercase tracking-wider px-3 py-2 fw-bold">
                {categoryName}
              </span>

              <h2 className="fw-bold mb-2 display-6 text-white text-uppercase">
                {title}
              </h2>
              <div className="rate-box d-flex align-items-center gap-2 mb-4">
                <div className="elite-stars-system fs-5">
                  <i className="fa fa-star me-1"></i>
                  <i className="fa fa-star me-1"></i>
                  <i className="fa fa-star me-1"></i>
                  <i className="fa fa-star me-1"></i>
                  <i className="fa fa-star-half-o me-1"></i>
                </div>
                <span className="text-muted small">
                  (4.7 verified specifications)
                </span>
              </div>
              <p className="small mb-3">
                Availability:{" "}
                {stockAvailable > 0 ? (
                  <span className="text-success fw-bold">
                    {stockAvailable} In Stock
                  </span>
                ) : (
                  <span className="text-danger fw-bold">Out of Stock</span>
                )}
              </p>

              <div className="info-price-tier mb-4 d-flex align-items-center gap-3">
                {hasDiscount ? (
                  <>
                    <h3 className="text-success fw-bold display-5 m-0">
                      ${discountedPrice.toLocaleString()}
                    </h3>
                    <span className="text-muted text-decoration-line-through fs-4">
                      ${originalPrice.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <h3 className="text-success fw-bold display-5 m-0">
                    ${originalPrice.toLocaleString()}
                  </h3>
                )}
              </div>

              <p className="lead text-muted mb-4 elite-details-desc">
                {description}
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                <div className="quantity-controller d-flex align-items-center rounded-3 border border-secondary">
                  <button
                    className="btn text-white px-3 fw-bold fs-5 counter-control-btn"
                    onClick={handleDecrement}
                  >
                    -
                  </button>
                  <span className="fw-bold px-2 fs-5 text-center qty-display-value">
                    {quantity}
                  </span>
                  <button
                    className="btn text-white px-3 fw-bold fs-5 counter-control-btn"
                    onClick={handleIncrement}
                  >
                    +
                  </button>
                </div>

                <button
                  aria-label="Add to Cart"
                  type="button"
                  className="btn btn-elite-primary px-5 py-3 rounded-3 fs-5 flex-grow-1 fw-bold deployment-add-btn"
                  onClick={handleDeployToCart}
                  disabled={stockAvailable === 0}
                >
                  {stockAvailable > 0 ? "Add To Cart" : "Sold Out"}
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ProductDetails;

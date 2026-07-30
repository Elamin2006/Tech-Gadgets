import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row, Spinner, Form, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { CartService } from "../../services/customer/cart.service.js";
import { updateItemQuantity, removeItemFromCart, fetchCart, clearUserCart } from "../../store/slices/cartSlice";
import OrderService from "../../services/customer/order.service";
import "./Cart.css";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartState = useSelector((state) => state.cart || {});
  const {
    cartList: cartItems = [],
    totalCartPrice: totalPrice = 0,
    isLoading = false,
  } = cartState;
  const cartId =
    cartState._id || cartState.data?._id || cartState.cartList?.[0]?.cartId;
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    details: "",
    phone: "",
    city: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
  });
  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchCart());
  }, [dispatch]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (
      !shippingAddress.details ||
      !shippingAddress.phone ||
      !shippingAddress.city
    ) {
      setCheckoutError("Please fill in all shipping fields.");
      return;
    }

    if (
      paymentMethod === "card" &&
      (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc)
    ) {
      setCheckoutError("Please fill in all card verification credentials.");
      return;
    }

    try {
      setIsSubmitting(true);
      setCheckoutError(null);

      let response;
      if (paymentMethod === "cash") {
        response = await OrderService.createCashOrder(shippingAddress);
      } else {
        console.log("Processing Card Payment via Gateway...", cardDetails);
        response = await OrderService.createCashOrder(shippingAddress);
      }

      if (response.status === "success" || response.data) {
        dispatch(clearUserCart());
        window.location.href = "/orders";
      }
    } catch (error) {
      setCheckoutError(
        error.response?.data?.message || error.message || "Transaction failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const fetchLatestCart = useCallback(() => dispatch(fetchCart()), [dispatch]);

  // useMemo: helper extractors avoid inline function recreation in render
  const getProductId = useCallback(
    (item) => item?.productId?._id || item?.productId || item?.product?._id || null,
    []
  );

  const getProductImage = useCallback((item) => {
    if (item?.productId && typeof item.productId === "object") {
      return item.productId.image || item.image || item.product?.image || null;
    }
    return item.image || item.product?.image || null;
  }, []);

  const getProductName = useCallback((item) => {
    if (item?.productId && typeof item.productId === "object") {
      return item.productId.name || item.name || item.product?.name || null;
    }
    return item.name || item.product?.name || null;
  }, []);

 
const handleIncrement = useCallback(
  (item) => {
    if (!item._id) return;
    dispatch(updateItemQuantity({ itemId: item._id, quantity: item.quantity + 1 }));
  },
  [dispatch]
);
 
const handleDecrement = useCallback(
  (item) => {
    if (!item._id) return;
 
    if (item.quantity > 1) {
      dispatch(updateItemQuantity({ itemId: item._id, quantity: item.quantity - 1 }));
    } else {
      dispatch(removeItemFromCart(item._id));
    }
  },
  [dispatch]
);

  if (isLoading && cartItems.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="info" />
      </div>
    );
  }

  return (
    <section className="cart-items py-5 my-5 my-xs-0 text-start text-white">
      <Container>
        <Row className="justify-content-center g-4">
          <Col md={8}>
            {cartItems.length === 0 && (
              <h1 className="no-items product text-center py-5 text-muted">
                No Items are added in Cart
              </h1>
            )}

            {cartItems.map((item) => {
              const itemPrice = item.price || item.productId?.price || 0;
              const productQty = itemPrice * item.quantity;
              const productName = getProductName(item) || "Unknown Hardware";
              const productImg =
                getProductImage(item) ||
                "https://placehold.co/150/171c20/dee3e8?text=Gear";

              return (
                <div
                  className="cart-list p-3 mb-3 rounded-3 position-relative "
                  key={item._id}
                >
                  <Row className="align-items-center">
                    <Col className="image-holder" xs={4} sm={4} md={3}>
                      <img
                        src={productImg}
                        alt={productName}
                        className="img-fluid h-100 rounded-2"
                      />
                    </Col>

                    <Col xs={8} sm={8} md={9}>
                      <Row className="cart-content align-items-center ">
                        <Col xs={12} sm={9} className="cart-details ">
                          <h3 className="fs-5 fw-bold text-white mb-4">
                            {productName}
                          </h3>
                          <h4 className="fs-6 text-white-muted ">
                            Unit Price: ${itemPrice.toLocaleString()}.00
                          </h4>
                          <h4 className="fs-6">Quantity: {item.quantity}</h4>

                          <span className="text-success fw-bold d-inline-block ">
                            Subtotal Price: ${productQty.toLocaleString()}.00
                          </span>
                          <h4 />
                        </Col>

                        <Col
                          xs={12}
                          sm={3}
                          className="cartControl d-flex gap-2 mt-2 align-items-center 
                          mt-sm-0"
                        >
                          <button
                            className="incCart btn btn-sm btn-outline-info text-white"
                            onClick={() => handleIncrement(item)}
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>

                          <button
                            className="desCart btn btn-sm btn-outline-secondary text-white"
                            onClick={() => handleDecrement(item)}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                        </Col>
                      </Row>
                    </Col>

                    <button
                      className=" btn btn-outline-danger  delete-btn position-absolute
                       top-0 border-0 bg-transparent text-danger fs-4"
                      onClick={async () => {
                        try {
                          await CartService.removeFromCart(item._id);
                          fetchLatestCart();
                        } catch (error) {
                          console.error("Cart remove failed", error);
                        }
                      }}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </Row>
                </div>
              );
            })}
          </Col>

          <Col md={4}>
            <div className="cart-total p-4 rounded-3 border border-secondary bg-panel">
              <h2 className="fs-4 fw-bold border-bottom pb-3 mb-3">
                Cart Summary
              </h2>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fs-5  m-0">Total Price :</h4>
                <h3 className="fs-4 fw-bold text-success m-0">
                  ${totalPrice?.toLocaleString()}.00
                </h3>
              </div>

              {!showCheckout ? (
                <button
                  className="btn btn-info w-100 text-dark fw-bold  mt-4 rounded-3 fs-5"
                  disabled={cartItems.length === 0}
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </button>
              ) : (
                <Form
                  onSubmit={handlePlaceOrder}
                  className="mt-4 border-top border-secondary pt-3"
                >
                  <h5 className="text-info mb-3 small fw-bold">
                    SHIPPING ADDRESS DETAILS
                  </h5>

                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">City</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="City"
                      className="bg-dark text-white border-secondary small"
                      value={shippingAddress.city || ""}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          city: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">
                      Detailed Address
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Detailed Address"
                      className="bg-dark text-white border-secondary small"
                      value={shippingAddress.details || ""}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          details: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">
                      Contact Phone Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Active Phone Number"
                      className="bg-dark text-white border-secondary small"
                      value={shippingAddress.phone || ""}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          phone: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <h5
                    className="text-info mb-3 small fw-bold border-top 
                  border-secondary pt-3"
                  >
                    PAYMENT GATEWAY OPTION
                  </h5>
                  <div className="d-flex gap-3 mb-3">
                    <Form.Check
                      type="radio"
                      label="Cash on Delivery"
                      name="paymentMethod"
                      id="cashRadio"
                      className="small text-white"
                      checked={paymentMethod === "cash"}
                      onChange={() => {
                        setPaymentMethod("cash");
                        setCheckoutError(null);
                      }}
                    />
                    <Form.Check
                      type="radio"
                      label="Credit/Debit Card"
                      name="paymentMethod"
                      id="cardRadio"
                      className="small text-white"
                      checked={paymentMethod === "card"}
                      onChange={() => {
                        setPaymentMethod("card");
                        setCheckoutError(null);
                      }}
                    />
                  </div>

                  {paymentMethod === "card" && (
                    <div
                      className="card-details-fields p-3 mb-3 rounded-3 bg-dark-deep
                       border border-secondary"
                    >
                      <h6 className="small fw-bold mb-2">
                        SECURE CARD DETAILS
                      </h6>
                      <Form.Group className="mb-2">
                        <Form.Label className="tiny fw-bold">
                          Card Number
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="💳 0000 0000 0000 0000"
                          className="bg-dark text-white border-secondary small"
                          value={cardDetails.number || ""}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              number: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                      <Row className="g-2">
                        <Col xs={7}>
                          <Form.Label className="small">
                            Expiration Date
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="MM / YY"
                            className="bg-dark text-white border-secondary small"
                            value={cardDetails.expiry || ""}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                expiry: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col xs={5}>
                          <Form.Label className="tiny">Security</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="CVC"
                            className="bg-dark text-white border-secondary small"
                            maxLength="3"
                            value={cardDetails.cvc || ""}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                cvc: e.target.value,
                              })
                            }
                          />
                        </Col>
                      </Row>
                    </div>
                  )}

                  {checkoutError && (
                    <div className="alert alert-danger py-2 small border-0 rounded-3 mb-3">
                      ⚠️ {checkoutError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`btn w-100 fw-bold py-2 rounded-3 mb-2
             ${paymentMethod === "card" ? "btn-warning text-dark" : "btn-success"}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : paymentMethod === "card" ? (
                      "Pay & Sync Order"
                    ) : (
                      "Confirm"
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm w-100 text-white"
                    onClick={() => setShowCheckout(false)}
                  >
                    Back to Summary
                  </button>
                </Form>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Cart;

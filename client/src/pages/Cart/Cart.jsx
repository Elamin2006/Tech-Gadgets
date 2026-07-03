import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { CartService } from "../../services/cart.service.js";
import { fetchCart } from "../../store/slices/cartSlice"; 
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

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchCart());
  }, [dispatch]);

  const getProductId = (item) =>
    item?.productId?._id || item?.productId || item?.product?._id || null;

  const getProductImage = (item) => {
    if (item?.productId && typeof item.productId === "object") {
      return item.productId.image || item.image || item.product?.image || null;
    }
    return item.image || item.product?.image || null;
  };

  const getProductName = (item) => {
    if (item?.productId && typeof item.productId === "object") {
      return item.productId.name || item.name || item.product?.name || null;
    }
    return item.name || item.product?.name || null;
  };

  const fetchLatestCart = () => dispatch(fetchCart());

  const handleIncrement = async (item) => {
    const itemId = item._id;
    if (!itemId) return;

    try {
      await CartService.updateCartItemQuantity(itemId, item.quantity + 1);
      fetchLatestCart();
    } catch (error) {
      console.error("Cart increment failed", error);
    }
  };

  const handleDecrement = async (item) => {
    const itemId = item._id;
    if (!itemId) return;

    if (item.quantity > 1) {
      try {
        await CartService.updateCartItemQuantity(itemId, item.quantity - 1);
        fetchLatestCart();
      } catch (error) {
        console.error("Cart decrement failed", error);
      }
    } else {
      try {
        await CartService.removeFromCart(itemId);
        fetchLatestCart();
      } catch (error) {
        console.error("Cart decrement failed", error);
      }
    }
  };

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
                    {/* الصورة */}
                    <Col className="image-holder" xs={4} sm={4} md={3} >
                      <img
                        src={productImg}
                        alt={productName}
                        className="img-fluid rounded-2"
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
                          <h4 className="fs-6"> Quantity: {item.quantity}{" "}</h4>
                          
                          <span className="text-success fw-bold d-inline-block ">
                              Total Price: ${productQty.toLocaleString()}.00
                            </span><h4/>
                        </Col>

                        <Col
                          xs={12}
                          sm={3}
                          className="cartControl d-flex gap-2 mt-2 align-items-center mt-sm-0"
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
                      className=" btn btn-outline-danger  delete-btn position-absolute top-0  border-0 bg-transparent 
                      text-danger fs-4"
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
            <div className="cart-total p-4 rounded-3 ">
              <h2 className="fs-4 fw-bold border-bottom pb-3 mb-3">
                Cart Summary
              </h2>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="fs-5 text-muted m-0">Total Price :</h4>
                <h3 className="fs-4 fw-bold text-success m-0">
                  ${totalPrice?.toLocaleString()}.00
                </h3>
              </div>
              <button 
              className="btn btn-info w-100 text-dark fw-bold py-3 mt-4 rounded-3 fs-5"
              onClick={()=> navigate("/orders")}>
                Order Now
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Cart;

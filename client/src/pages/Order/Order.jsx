import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Badge,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import OrderService from "../../services/order.service";
import "./Order.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await OrderService.getAllOrders();
        const fetchedOrders = response?.data || response || [];
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Error operationalizing orders fetch:", err);
        setError(err.message || "Failed to retrieve deployment orders ledger.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserOrders();
  }, []);

  const formatDate = (dateObj) => {
    const rawDate = dateObj?.$date || dateObj;
    if (!rawDate) return "N/A";
    return new Date(rawDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning text-dark";
      case "cancelled":
        return "danger";
      default:
        return "info text-dark";
    }
  };

  const getProductName = (item) => {
    if (item?.productId && typeof item.productId === "object") {
      return item.productId.name || item.name || "Hardware Item";
    }
    return item.name || item.productId || "Hardware Item";
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-dark text-white"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="info" />
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper bg-dark text-white text-start">
      <Container>
        <div
          className="d-flex justify-content-between align-items-center mb-5 
          border-bottom border-secondary pb-3"
        >
          <div>
            <h2 className="fw-bold text-info m-0">Order Summary</h2>
            <p className="text-white-50 small m-0">
              Track your real-time operational hardware orders
            </p>
          </div>
          <Badge bg="secondary" className="fs-6 px-3 py-2 text-white">
            Total Orders: {orders.length}
          </Badge>
        </div>

        {error && (
          <Alert variant="danger" className="border-0 rounded-3">
            {error}
          </Alert>
        )}

        {orders.length === 0 ? (
          <div
            className="text-center py-5 rounded-3 border border-dashed border-secondary
           bg-panel"
          >
            <h4 className="text-white-50 m-0">
              No active orders deployed to your terminal.
            </h4>
          </div>
        ) : (
          <div className="orders-stack d-flex flex-column gap-4">
            {orders.map((order) => {
              const orderId = order._id?.$oid || order._id;

              return (
                <Card
                  className="order-master-card border-secondary text-white bg-panel rounded-3
                 overflow-hidden"
                  key={orderId}
                >
                  <Card.Header
                    className="bg-header-panel d-flex flex-wrap justify-content-between
                   align-items-center gap-2 py-3 border-secondary"
                  >
                    <div>
                      <span className="text-white-50 small block-id">
                        ORDER ID:
                      </span>
                      <span className="fw-bold text-light font-monospace">
                        {orderId}
                      </span>
                    </div>
                    <div className="d-flex gap-2">
                      <Badge
                        bg={getStatusBadgeVariant(order.status)}
                        className="text-uppercase px-3 py-2"
                      >
                        {order.status || "Processing"}
                      </Badge>
                    </div>
                  </Card.Header>

                  <Card.Body className="p-4">
                    <Row className="g-4">
                      <Col lg={8}>
                        <h5 className="text-info fw-bold mb-3">
                          Manifest Summary
                        </h5>
                        <div className="table-responsive">
                          <Table
                            responsive
                            className="table-dark table-hover m-0 align-middle"
                          >
                            <thead>
                              <tr className="text-light small border-secondary fw-bold">
                                <th>Product ID</th>
                                <th className="text-center">Quantity</th>
                                <th className="text-end">Unit Price</th>
                                <th className="text-end">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.orderItems?.map((item, idx) => {
                                const itemId =
                                  item._id?.$oid || item._id || idx;
                                const productName = getProductName(item);

                                return (
                                  <tr key={itemId} className="border-secondary">
                                    <td className="fw-semibold text-white">
                                      {productName}
                                    </td>
                                    <td className="text-center fw-bold text-info">
                                      {item.quantity}
                                    </td>
                                    <td className="text-end text-light">
                                      ${item.price?.toLocaleString()}.00
                                    </td>
                                    <td className="text-end text-success fw-bold">
                                      $
                                      {(
                                        item.quantity * item.price
                                      )?.toLocaleString()}
                                      .00
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      </Col>

                      <Col
                        lg={4}
                        className="border-start border-secondary-mobile"
                      >
                        <div className="shipping-intel mb-4">
                          <h5 className="text-info fw-bold mb-3">
                            Shipping information
                          </h5>
                          <p className="m-0 text-light small fw-bold">
                            {order.shippingAddress?.city}
                          </p>
                          <p className="m-0 text-white-50 small">
                            {order.shippingAddress?.details}
                          </p>
                          <p className="m-0 text-info small font-monospace">
                            {order.shippingAddress?.phone}
                          </p>
                        </div>

                        <div
                          className="financial-intel bg-dark-deep p-3 rounded-3 border 
                        border-secondary"
                        >
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-white-50 small">
                              Timeline:
                            </span>
                            <span className="text-light small">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-white-50 small">
                              Payment Sync:
                            </span>
                            <Badge
                              bg={order.isPaid ? "success" : "danger"}
                              className="px-2 py-1"
                            >
                              {order.isPaid ? "PAID" : "UNPAID"}
                            </Badge>
                          </div>
                          <div className="d-flex justify-content-between mb-3">
                            <span className="text-white-50 small">
                              Logistics:
                            </span>
                            <Badge
                              bg={order.isDelivered ? "success" : "secondary"}
                              className="px-2 py-1"
                            >
                              {order.isDelivered ? "DELIVERED" : "IN TRANSIT"}
                            </Badge>
                          </div>
                          <div
                            className="d-flex justify-content-between align-items-center 
                          pt-2 border-top border-secondary"
                          >
                            <span className="fw-bold text-light">
                              Total Charged:
                            </span>
                            <h4 className="text-success fw-bold m-0">
                              ${order.totalOrderPrice?.toLocaleString()}.00
                            </h4>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
};

export default Orders;

import React, { useState, useEffect, Fragment } from "react";
import { Col, Container, Row, Spinner, Alert } from "react-bootstrap";
import api from "../../services/api"; 
import ProductCard from "../../components/ProductCard/ProductCard";
import "./Shop.css";

const Shop = () => {
  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
   
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        
        const response = await api.get("/products", {
          signal: controller.signal,
  timeout: 30000 
        }, 
);

        const data = response.data?.data ?? response.data;
        setProductsList(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") return;

        console.error("Failed to fetch products:", error);
        setApiError("Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo(0, 0);

    return () => controller.abort();
  }, []);

  const getProductKey = (product) =>
    product._id?.$oid ?? product._id ?? product.id;

  return (
    <Fragment>

      <section className="shop-page-section p-0">
        
        <Container className="pb-5">
          {isLoading && (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <Spinner animation="border" variant="info" className="mb-3" />
              <p style={{ color: "var(--color-on-surface-variant)" }}>
                Fetching live inventory...
              </p>
            </div>
          )}

          {!isLoading && apiError && (
            <Alert
              variant="danger"
              className="border-0 rounded-3"
              style={{
                backgroundColor: "var(--color-error-container)",
                color: "var(--color-on-error-container)",
              }}
            >
              {apiError}
            </Alert>
          )}

          {!isLoading && !apiError && (
            <Row className="g-4">
              {productsList.length === 0 ? (
                <Col className="text-center py-5">
                  <p style={{ color: "var(--color-on-surface-variant)" }}>
                    No products found in inventory.
                  </p>
                </Col>
              ) : (
                productsList.map((product) => (
                  <ProductCard
                    key={getProductKey(product)}
                    product={product}
                    isDiscountPage={false}
                  />
                ))
              )}
            </Row>
          )}
        </Container>
      </section>
    </Fragment>
  );
};

export default Shop;
import React, { useState, useEffect, Fragment } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import API from "../../services/api";

import Banner from "../../components/Banner/Banner";
import FilterSelect from "../../components/Filter/FilterSelect";
import SearchBar from "../../components/Filter/SearchBar";
import ShopList from "../../components/ShopList/ShopList";
import useWindowScrollToTop from "../../hooks/useWindowScrollToTop";
import "./Shop.css";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useWindowScrollToTop();

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        setIsLoading(true);
        
        const response = await API.get("/products");
        
        const fetchedData = response.data?.data || response.data || [];

        setProducts(fetchedData);
        setFilterList(fetchedData);
        setApiError(null);
      } catch (error) {
        console.error("Error backing up inventory:", error);
        setApiError("Failed to synchronize active cloud inventory.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveProducts();
  }, []);

  return (
    <Fragment>
      <Banner title="Elite Hardware Grid" />

      <section className="shop-page-wrapper">
        <div className="filter-sticky-bar mb-5">
          <Container>
            <Row className="justify-content-center g-3">
              <Col md={4} xs={12} className="order-2 order-md-1">
                <FilterSelect
                  products={products}
                  setFilterList={setFilterList}
                />
              </Col>
              <Col md={8} xs={12} className="order-1 order-md-2">
                <SearchBar products={products} setFilterList={setFilterList} />
              </Col>
            </Row>
          </Container>
        </div>

        <Container className="pb-5">
          {isLoading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5 dynamic-loader">
              <Spinner animation="border" variant="info" className="mb-3" />
              <p className="loader-text">
                Calibrating active catalog database...
              </p>
            </div>
          ) : apiError ? (
            <Alert
              variant="danger"
              className="border-0 text-white rounded-3 global-api-alert"
            >
              ⚠️ {apiError}
            </Alert>
          ) : (
            
            <ShopList productItems={filterList} />
          )}
        </Container>
      </section>
    </Fragment>
  );
};

export default Shop;
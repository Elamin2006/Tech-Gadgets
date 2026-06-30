import React from "react";
import { Row, Col } from "react-bootstrap";
import ProductCard from "../ProductCard/ProductCard";
import "./ShopList.css";

export default function ShopList({ productItems }) {
  if (productItems.length === 0) {
    return (
      <Col xs={12} className="text-center py-5 empty-list-container">
        <div className="empty-icon">🚫</div>
        <h3 className="mt-3 empty-title">No Tactical Gear Found</h3>
        <p className="text-muted">No items match your active filtration specifications.</p>
      </Col>
    );
  }

  return (
    <Row className="g-4 shop-list-row">
      {productItems.map((product) => (
        <ProductCard 
          key={product._id?.$oid || product._id || product.id} 
          product={product} 
        />
      ))}
    </Row>
  );
}
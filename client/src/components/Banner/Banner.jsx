import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Banner.css";
import productBg from '../../assets/Banner/Gemini_Generated_Image_xvws72xvws72xvws.png';

const Banner = ({ title }) => {
    
  return (
    <div className="image-container">
      <img src={productBg} alt="Product-bg" />
      <div className="overlay">
        <Container>
          <Row>
            <Col>
              <h2>{title}</h2>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Banner;
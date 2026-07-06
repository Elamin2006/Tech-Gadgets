import { Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SlideCard = ({ title, desc, cover }) => {
  const navigate = useNavigate();

  return (
    <Container className="elite-slide-box">
      <Row className="align-items-center g-4">
        <Col md={6} className="text-content">
          <h1 className="slide-title">{title}</h1>
          <p className="slide-desc">{desc}</p>
          <button 
            className="btn btn-info btn-elite-slider px-4 py-2 fw-bold text-dark rounded-3"
            onClick={() => navigate("/shop")}
          >
            Visit Collections
          </button>
        </Col>
        <Col md={6} className="image-content text-center">
          <img src={cover} alt={title} className="img-fluid slide-img" />
        </Col>
      </Row>
    </Container>
  );
};

export default SlideCard;
import { Container, Row } from "react-bootstrap";
import ProductCard from "../ProductCard/ProductCard";
import "./Section.css";

const Section = ({ title, isAlternateBg, productItems }) => {
  return (
    <section
      className={`elite-section ${isAlternateBg ? "bg-dark-accent" : "bg-dark-deep"}`}
    >
      <Container>
        <div className="section-heading-wrapper mb-5">
          <h2 className="section-elite-title">{title}</h2>
          <div className="title-animated-line"></div>
        </div>

        <Row className="g-4 justify-content-center">
          {productItems.map((productItem) => (
            <ProductCard
              key={productItem._id || productItem.id}
              title={title}
              product={productItem}
            />
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Section;

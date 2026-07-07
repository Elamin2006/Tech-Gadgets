import { Fragment, useEffect, useState } from "react";
import { ProductService } from "../services/product.service";
import Wrapper from "../components/Wrapper/Wrapper"; 
import SliderHome from "../components/Slider/SliderHome";
import Section from "../components/Sections/Section"; 
import Footer from "../components/Footer/Footer"; 
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";
import { Spinner } from "react-bootstrap";

const Home = () => {
  useWindowScrollToTop();

  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSales, setBestSales] = useState([]);
  const [discountProducts, setDiscountProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getAllProducts();
        const allProducts = response.data || [];
        const arrivals = [...allProducts]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);

        const sales = [...allProducts]
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 4);

        const discounts = allProducts
          .filter((item) => item.discount > 0)
          .slice(0, 4);

        setNewArrivals(arrivals);
        setBestSales(sales);
        setDiscountProducts(discounts);

      } catch (error) {
        console.error("Failed to load home page data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div 
      className="d-flex justify-content-center align-items-center bg-dark"
       style={{ minHeight: "80vh" }}>
        <Spinner animation="border" variant="info" />
      </div>
    );
  }

  return (
    <Fragment>
      <SliderHome />
      
<Wrapper />      
      {discountProducts.length > 0 && (
        <Section
          title="Big Discount"
          isAlternateBg={false}
          productItems={discountProducts}
        />
      )}
      
      {newArrivals.length > 0 && (
        <Section
          title="New Arrivals"
          isAlternateBg={true}
          productItems={newArrivals}
        />
      )}
      
      {bestSales.length > 0 && (
        <Section 
          title="Best Sales" 
          isAlternateBg={false}
          productItems={bestSales} 
        />
      )}
    </Fragment>
  );
};

export default Home;
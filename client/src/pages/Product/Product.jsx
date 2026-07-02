import { Fragment, useEffect, useState } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Banner from "../../components/Banner/Banner";
import ShopList from "../../components/ShopList/ShopList"; 
import ProductDetails from "../../components/ProductDetails/ProductDetails";
import ProductReviews from "../../components/ProductReviews/ProductReviews";
import useWindowScrollToTop from "../../hooks/useWindowScrollToTop";
import API from "../../services/api";

const Product = () => {
  const { id } = useParams(); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useWindowScrollToTop();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const productRes = await API.get(`/products/${id}`);
        const currentProduct = productRes.data?.data || productRes.data;
        setSelectedProduct(currentProduct);

        const allProductsRes = await API.get("/products");
        const allProducts = allProductsRes.data?.data || allProductsRes.data || [];

        const currentCategory = currentProduct?.category || currentProduct?.categoryId?.name;
        
        const related = allProducts.filter(
          (item) => 
            (item.category === currentCategory || item.categoryId?.name === currentCategory) && 
            item._id !== currentProduct._id
        );

        setRelatedProducts(related);

      } catch (err) {
        console.error("Error retrieving product intelligence:", err);
        setError("Failed to load product payload blueprints.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-dark text-white" style={{ minHeight: "80vh" }}>
        <Spinner animation="border" variant="info" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5 my-5">
        <Alert variant="danger" className="border-0 rounded-3">{error}</Alert>
      </Container>
    );
  }

  return (
    <Fragment>
      <Banner title={selectedProduct?.name || selectedProduct?.title || "Product Specs"} />
      
      <ProductDetails 
        selectedProduct={{
          ...selectedProduct,
          rating: selectedProduct?.rating || 4.7,
          reviewsCount: selectedProduct?.reviewsCount || 18
        }} 
      />
      
      <ProductReviews 
        selectedProduct={{
          ...selectedProduct,
          reviews: selectedProduct?.reviews || [
            { id: 1, user: "Alex_Tactical", rating: 5, comment: "Exceptional build quality. Exceeded expectations." },
            { id: 2, user: "Ghost_Operator", rating: 4, comment: "Solid hardware synchronization." }
          ]
        }} 
      />

      <section className="related-products py-5 bg-dark text-white text-start">
        <Container className="mb-4">
          <h3 className="fw-bold text-info">You Might Also Like</h3>
        </Container>
        <Container>
          <ShopList productItems={relatedProducts} />
        </Container>
      </section>
    </Fragment>
  );
};

export default Product;
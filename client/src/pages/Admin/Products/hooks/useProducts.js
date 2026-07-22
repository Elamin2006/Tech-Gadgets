import { useState, useEffect, useCallback } from "react";
import { AdminProductService } from "../../../../services/admin/product.service";
import { CategoryService } from "../../../../services/admin/category.service";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productRes, categoryRes] = await Promise.all([
        AdminProductService.getAllProducts(),
        CategoryService.getAllCategories(),
      ]);
      setProducts(Array.isArray(productRes) ? productRes : productRes?.data || []);
      setCategories(Array.isArray(categoryRes) ? categoryRes : categoryRes?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load catalog data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = async (formData) => {
    const newProduct = await AdminProductService.createProduct(formData);
    await fetchData(); // refetch: category counts, populated refs may change
    return newProduct;
  };

  const updateProduct = async (id, formData) => {
    const updated = await AdminProductService.updateProduct(id, formData);
    await fetchData();
    return updated;
  };

  const deleteProduct = async (id) => {
    await AdminProductService.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id)); // optimistic, no refetch needed
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { products, categories, loading, error, refresh: fetchData, createProduct, updateProduct, deleteProduct };
}
import { useState, useEffect, useCallback } from "react";
import { CategoryService } from "../../../../services/admin/category.service";

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CategoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err.message || "Failed to retrieve category classification");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = async (formData) => {
    try {
      const responseData = await CategoryService.createCategory(formData);
      const newCategory = responseData.data; // Extract category object from API response envelope
      // Immediately reconcile local cache state array
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      throw new Error(err.message || "Failed to provision new category asset.");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await CategoryService.deleteCategory(id);
      // Reconcile deletion locally to save a network fetch roundtrip
      setCategories((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      throw new Error(err.message || "Failed to delete category");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    deleteCategory,
  };
}
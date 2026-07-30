import React, { useState, useMemo, useCallback } from "react";
import useProducts from "./hooks/useProducts";
import useDebounce from "../../../hooks/useDebounce";
import ProductTable from "./components/ProductTable/ProductTable";
import ProductForm from "./components/ProductForm/ProductForm";
import Modal from "../../../components/common/Modal/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog/ConfirmDialog";
import Loader from "../../../components/common/Loader/Loader";
import Button from "../../../components/common/Button/Button";
import { toast } from "react-toastify";
import "./ProductManagement.css";

export default function ProductManagement() {
  const {
    products,
    categories,
    loading,
    error,
    refresh,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Filtered Products List — depends on debounced query, not raw input
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const pCatId = typeof p.categoryId === "object" ? p.categoryId?._id : p.categoryId;
      const matchesCategory = selectedCategory === "" || pCatId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearchQuery, selectedCategory]);

  
  const handleOpenAddModal = useCallback(() => {
    setEditingProduct(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback((product) => {
    setProductToDelete(product);
    setIsConfirmOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }, []);

  const handleFormSubmit = useCallback(async (formData) => {
    setFormSubmitting(true);
    try {
      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id;
        await updateProduct(id, formData);
        toast.success("Product updated successfully.");
      } else {
        await createProduct(formData);
        toast.success("Product created successfully.");
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      toast.error(err.message || "Operation failed.");
    } finally {
      setFormSubmitting(false);
    }
  }, [editingProduct, updateProduct, createProduct]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!productToDelete) return;
    setDeleteSubmitting(true);
    try {
      const id = productToDelete._id || productToDelete.id;
      await deleteProduct(id);
      toast.success("Product deleted successfully.");
      setIsConfirmOpen(false);
      setProductToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete product.");
    } finally {
      setDeleteSubmitting(false);
    }
  }, [productToDelete, deleteProduct]);

  if (loading) {
    return (
      <div className="product-management-loading">
        <Loader message="Loading catalog inventory..." size="lg" />
      </div>
    );
  }

  return (
    <div className="product-management-view">
      {/* Header */}
      <div className="product-view-header">
        <div className="title-area">
          <h2 className="product-title">Product Management</h2>
          <span className="product-subtitle">Manage store products, stock levels, and pricing</span>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} icon="add">
          Add Product
        </Button>
      </div>

      {/* Control Panel */}
      <div className="product-control-panel">
        <div className="controls-left">
          <div className="search-box-wrapper">
            <span className="material-symbols-outlined search-field-icon">search</span>
            <input
              type="text"
              className="product-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
            />
          </div>

          <select
            className="product-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="controls-right">
          Total Products: <span className="text-highlight">{filteredProducts.length}</span>
        </div>
      </div>

      {/* Error state */}
      {error ? (
        <div className="product-management-error">
          <span className="material-symbols-outlined error-icon">error</span>
          <h3 className="error-title">Error Loading Inventory</h3>
          <p className="error-desc">{error}</p>
          <Button variant="outline" onClick={refresh} icon="refresh">
            Retry
          </Button>
        </div>
      ) : (
        /* Table View */
        <ProductTable
          products={filteredProducts}
          categories={categories}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteDialog}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        size="md"
      >
        <ProductForm
          categories={categories}
          initialData={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          loading={formSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteSubmitting}
      />
    </div>
  );
}
import React, { useState, useMemo } from "react";
import useCategories from "./hooks/useCategories";
import CategoryTable from "./components/CategoryTable/CategoryTable";
import CategoryForm from "./components/CategoryForm/CategoryForm";
import Modal from "../../../components/common/Modal/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog/ConfirmDialog";
import Loader from "../../../components/common/Loader/Loader";
import Button from "../../../components/common/Button/Button";
import { toast } from "react-toastify";
import "./CategoryManagement.css";

export default function CategoryManagement() {
  const {
    categories,
    loading,
    error,
    refresh,
    createCategory,
    deleteCategory,
  } = useCategories();

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleOpenAddModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (category) => {
    setCategoryToDelete(category);
    setIsConfirmOpen(true);
  };

  const handleFormSubmit = async (categoryData) => {
    setFormSubmitting(true);
    try {
      await createCategory(categoryData);
      toast.success("Category created successfully.");
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to create category.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setDeleteSubmitting(true);
    try {
      await deleteCategory(categoryToDelete._id);
      toast.success("Category deleted successfully.");
      setIsConfirmOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete category.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="category-management-loading">
        <Loader message="Loading categories..." size="lg" />
      </div>
    );
  }

  return (
    <div className="category-management-view">
      {/* Header Block */}
      <div className="category-view-header">
        <div className="title-area">
          <h2 className="category-title">Category Management</h2>
          <span className="category-subtitle">Create, view, and delete product categories</span>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} icon="add_box" className="category-add-btn">
          Add Category
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="category-control-panel">
        <div className="controls-left">
          <div className="search-box-wrapper">
            <span className="material-symbols-outlined search-field-icon">search</span>
            <input
              type="text"
              className="category-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
            />
          </div>
        </div>

        <div className="controls-right">
          Total Categories: <span className="text-highlight">{filteredCategories.length}</span>
        </div>
      </div>

      {/* Error state if applicable */}
      {error ? (
        <div className="category-management-error">
          <span className="material-symbols-outlined error-icon">error</span>
          <h3 className="error-title">Error Loading Categories</h3>
          <p className="error-desc">{error}</p>
          <Button variant="outline" onClick={refresh} icon="refresh">
            Retry
          </Button>
        </div>
      ) : (
        /* Categories Table */
        <CategoryTable
          categories={filteredCategories}
          onDelete={handleOpenDeleteDialog}
        />
      )}

      {/* Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Category"
        size="md"
      >
        <CategoryForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={formSubmitting}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? Products in this category will not be deleted.`}
        confirmLabel="Delete"
        loading={deleteSubmitting}
      />
    </div>
  );
}

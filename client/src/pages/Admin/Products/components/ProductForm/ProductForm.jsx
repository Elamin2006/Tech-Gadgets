import React, { useState, useEffect, useRef } from "react";
import Button from "../../../../../components/common/Button/Button";
import "./ProductForm.css";

export default function ProductForm({ categories, initialData, onSubmit, onCancel, loading }) {
  const isEditMode = Boolean(initialData);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [quantity, setQuantity] = useState("1");
  const [categoryId, setCategoryId] = useState("");
  const [errors, setErrors] = useState({});

  // Image upload state (from v1's dropzone UI)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Pre-populate fields when initialData (Editing Mode) changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price !== undefined ? String(initialData.price) : "");
      setDiscount(initialData.discount !== undefined ? String(initialData.discount) : "0");
      setQuantity(initialData.quantity !== undefined ? String(initialData.quantity) : "1");

      const catId = typeof initialData.categoryId === "object"
        ? initialData.categoryId?._id
        : initialData.categoryId;
      setCategoryId(catId || "");

      setImagePreview(initialData.image || "");
      setImageFile(null);
    }
  }, [initialData]);

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setErrors((prev) => ({ ...prev, image: undefined }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Product name is required.";
    } else if (name.trim().length > 100) {
      newErrors.name = "Product name cannot exceed 100 characters.";
    }

    if (!description.trim()) {
      newErrors.description = "Product description is required.";
    }

    if (price === "" || Number(price) < 0) {
      newErrors.price = "Price must be a positive number.";
    }

    if (discount !== "" && (Number(discount) < 0 || Number(discount) > 100)) {
      newErrors.discount = "Discount must be between 0% and 100%.";
    }

    if (quantity === "" || Number(quantity) < 0) {
      newErrors.quantity = "Quantity cannot be negative.";
    }

    // Image is required only during creation, optional during edit if existing image exists
    if (!isEditMode && !imageFile) {
      newErrors.image = "Product image file is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", Number(price));
    formData.append("discount", Number(discount) || 0);
    formData.append("quantity", Number(quantity) || 1);
    if (categoryId) formData.append("categoryId", categoryId);

    // Append file only if a new file was selected
    if (imageFile) {
      formData.append("image", imageFile);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-product-form" noValidate>
      {/* Product Name */}
      <div className="form-group">
        <label htmlFor="prod-name" className="form-label">Product Name *</label>
        <input
          id="prod-name"
          type="text"
          maxLength={100}
          className={`form-input ${errors.name ? "has-error" : ""}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Premium Ceramic Brake Pads"
          disabled={loading}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      {/* Category Dropdown */}
      <div className="form-group">
        <label htmlFor="prod-cat" className="form-label">Category</label>
        <select
          id="prod-cat"
          className="form-select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={loading}
        >
          <option value="">Select a Category (Optional)</option>
          {categories.map((cat) => (
            <option key={cat._id || cat.id} value={cat._id || cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Row: Price, Discount, Quantity */}
      <div className="form-row-3">
        <div className="form-group">
          <label htmlFor="prod-price" className="form-label">Price ($) *</label>
          <input
            id="prod-price"
            type="number"
            step="0.01"
            min="0"
            className={`form-input ${errors.price ? "has-error" : ""}`}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            disabled={loading}
          />
          {errors.price && <span className="error-text">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="prod-discount" className="form-label">Discount (%)</label>
          <input
            id="prod-discount"
            type="number"
            min="0"
            max="100"
            className={`form-input ${errors.discount ? "has-error" : ""}`}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="0"
            disabled={loading}
          />
          {errors.discount && <span className="error-text">{errors.discount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="prod-qty" className="form-label">Quantity *</label>
          <input
            id="prod-qty"
            type="number"
            min="0"
            className={`form-input ${errors.quantity ? "has-error" : ""}`}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="1"
            disabled={loading}
          />
          {errors.quantity && <span className="error-text">{errors.quantity}</span>}
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="prod-desc" className="form-label">Description *</label>
        <textarea
          id="prod-desc"
          rows={3}
          className={`form-textarea ${errors.description ? "has-error" : ""}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide detailed product specifications..."
          disabled={loading}
        />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      {/* Image Upload — drag & drop dropzone (ported from v1) */}
      <div className="form-group">
        <label className="form-label">
          {isEditMode ? "Replace Product Image (Optional)" : "Product Image *"}
        </label>

        <div
          className={`elite-drag-drop-zone ${isDragOver ? "drag-active" : ""} ${imagePreview ? "has-preview" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {imagePreview ? (
            <div className="preview-container">
              <img src={imagePreview} alt="Preview asset" className="dropzone-preview-img" />
              <button
                type="button"
                className="clear-image-btn"
                onClick={handleClearImage}
                disabled={loading}
              >
                <span className="material-symbols-outlined">delete</span>
                <span>Remove</span>
              </button>
            </div>
          ) : (
            <div className="dropzone-placeholder" onClick={handleTriggerUpload}>
              <span className="material-symbols-outlined cloud-upload-icon">cloud_upload</span>
              <p className="upload-cta">Drag & drop or click to upload</p>
              <p className="upload-spec">Supports PNG, JPG, or WebP</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="form-file-input"
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept="image/*"
            disabled={loading}
          />
        </div>

        {errors.image && <span className="error-text">{errors.image}</span>}
        {isEditMode && initialData?.image && !imageFile && (
          <span className="current-file-text">Current image preserved if no file selected.</span>
        )}
      </div>

      {/* Actions */}
      <div className="form-actions">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEditMode ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}


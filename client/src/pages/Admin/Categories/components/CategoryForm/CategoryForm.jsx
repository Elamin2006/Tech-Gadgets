import React, { useState } from "react";
import Button from "../../../../../components/common/Button/Button";
import "./CategoryForm.css";

export default function CategoryForm({
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim().toLowerCase();

    if (!cleanName) {
      setError("Category name cannot be empty.");
      return;
    }

    if (cleanName.length < 3) {
      setError("Category name must be at least 3 characters.");
      return;
    }

    if (cleanName.length > 15) {
      setError("Category name cannot exceed 15 characters.");
      return;
    }

    setError("");
    onSubmit({ name: cleanName });
  };

  return (
    <form onSubmit={handleSubmit} className="category-form-layout">
      <div className="form-group">
        <label htmlFor="cat-name" className="elite-field-label">Category Name *</label>
        <input
          id="cat-name"
          type="text"
          className="elite-form-input font-mono"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          placeholder="e.g., smartwatches"
          maxLength={15}
          required
        />
        <span className="field-hint">Rules: Min 3 characters, max 15 characters, will be saved in lowercase.</span>
        {error && <span className="field-error-msg">{error}</span>}
      </div>

      <div className="form-action-row">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Saving..." : "Add Category"}
        </Button>
      </div>
    </form>
  );
}

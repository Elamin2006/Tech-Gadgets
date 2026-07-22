import React from "react";
import Button from "../../../../../components/common/Button/Button";
import "./ProductTable.css";

export default function ProductTable({ products, categories, onEdit, onDelete }) {
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    if (typeof categoryId === "object" && categoryId.name) return categoryId.name;
    const found = categories.find((c) => (c._id || c.id) === categoryId);
    return found ? found.name : "Uncategorized";
  };

  if (products.length === 0) {
    return (
      <div className="product-table-empty">
        <span className="material-symbols-outlined empty-icon">inventory_2</span>
        <p className="empty-text">No products found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="product-table-wrapper">
      <table className="product-custom-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Final Price</th>
            <th>Stock Quantity</th>
            <th className="table-actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const id = product._id || product.id;
            const price = Number(product.price) || 0;
            const discount = Number(product.discount) || 0;
            const finalPrice = price - (price * (discount / 100));
            const isOutOfStock = product.quantity <= 0;

            return (
              <tr key={id}>
                <td>
                  <div className="product-info-cell">
                    <div className="product-avatar">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <span className="material-symbols-outlined fallback-icon">image</span>
                      )}
                    </div>
                    <div className="product-name-block">
                      <span className="product-title">{product.name}</span>
                      <span className="product-desc-short">{product.description}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-pill">{getCategoryName(product.categoryId)}</span>
                </td>
                <td className="fw-semibold">${price.toFixed(2)}</td>
                <td>
                  {discount > 0 ? (
                    <span className="discount-badge">-{discount}%</span>
                  ) : (
                    <span className="no-discount">—</span>
                  )}
                </td>
                <td className="fw-bold text-success">${finalPrice.toFixed(2)}</td>
                <td>
                  <span className={`stock-badge ${isOutOfStock ? "stock-out" : "stock-in"}`}>
                    {isOutOfStock ? "Out of Stock" : `${product.quantity} in stock`}
                  </span>
                </td>
                <td className="table-actions-cell">
                  <div className="action-buttons-group">
                    <Button
                      variant="outline"
                      size="sm"
                      icon="edit"
                      onClick={() => onEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon="delete"
                      onClick={() => onDelete(product)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


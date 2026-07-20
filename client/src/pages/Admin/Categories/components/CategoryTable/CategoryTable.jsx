import React from "react";
import Button from "../../../../../components/common/Button/Button";
import "./CategoryTable.css";

export default function CategoryTable({
  categories = [],
  onDelete,
}) {
  if (categories.length === 0) {
    return <div className="category-table-empty">No categories found in the database.</div>;
  }

  return (
    <div className="category-table-wrapper">
      <table className="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category Name</th>
            <th>Created At</th>
            <th className="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c._id}>
              <td>
                <span className="font-mono text-xs">{c._id}</span>
              </td>
              <td>
                <div className="category-name-info">
                  <span className="c-title-text font-mono text-highlight">{c.name}</span>
                </div>
              </td>
              <td>
                <span className="font-mono text-xs">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : "System Default"}
                </span>
              </td>
              <td>
                <div className="category-actions-cell">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(c)}
                    icon="delete"
                    title="Delete Category"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

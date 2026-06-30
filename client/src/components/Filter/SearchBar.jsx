import React from "react";

export default function SearchBar({ products, setFilterList }) {
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = products.filter((item) =>
      (item.name || item.title || "").toLowerCase().includes(searchTerm)
    );
    setFilterList(filtered);
  };

  return (
    <div className="position-relative w-100 d-flex align-items-center">
      
      <span className="position-absolute" 
        style={{ 
          right: "16px", 
          zIndex: 5, 
          pointerEvents: "none", 
          color: "#8892b0",
          display: "flex",
          alignItems: "center"
        }}
        >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          fill="currentColor" 
          viewBox="0 0 16 16"
          style={{ color: "var(--color-outline, #6c757d)" }}
        >
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0
           1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
           />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search hardware by name or specification..."
        className="form-control elite-search-input"
        onChange={handleSearch}
      />
    </div>
  );
}
import React from 'react';
import Select from 'react-select';

const options = [
    { value: "all", label: "All Categories" },
    { value: "mobile", label: "Smartphones" },
    { value: "laptops", label: "Laptops" },
];

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "var(--bg-surface-low, #171c20)",
        color: "white",
        borderRadius: "8px",
        borderColor: state.isFocused ? "var(--color-info, #0dcaf0)" : "rgba(255, 255, 255, 0.15)",
        boxShadow: "none",
        minHeight: "45px",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
            borderColor: "var(--color-info, #0dcaf0)"
        }
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1c2328", 
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        overflow: "hidden"
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected 
            ? "var(--color-info, #0dcaf0)" 
            : state.isFocused 
                ? "rgba(255, 255, 255, 0.08)" 
                : "transparent",
        color: state.isSelected ? "#111" : "white",
        cursor: "pointer",
        padding: "10px 15px",
        transition: "background-color 0.1s ease",
        "&:active": {
            backgroundColor: "var(--color-info, #0dcaf0)",
        }
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white", 
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "rgba(255, 255, 255, 0.5)",
    }),
    input: (provided) => ({
        ...provided,
        color: "white",
    })
};

const FilterSelect = ({ products, setFilterList }) => {
    
    const handleChange = (selectedOption) => {
        if (!selectedOption || selectedOption.value === "all") {
            setFilterList(products); 
        } else {
            const filtered = products.filter(item => 
                item.category === selectedOption.value || 
                item.categoryId?.name === selectedOption.value
            );
            setFilterList(filtered);
        }
    };

    return (
        <div className="filter-select-wrapper text-start">
            <Select
                options={options}
                placeholder="Filter By Category"
                styles={customStyles}
                onChange={handleChange}
                isSearchable={false} 
            />
        </div>
    );
};

export default FilterSelect;
"use client";

import { useState, useRef, useEffect } from "react";

export function ClassSelector({ viewedClass, classOptions, onChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);
  
  const handleClassSelect = (classId, e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(classId);
    setDropdownOpen(false);
  };
  
  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        id="classDropdown"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        반 선택
      </button>
      <ul
        className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}
        style={{ display: dropdownOpen ? "block" : "none" }}
        aria-labelledby="classDropdown"
        onClick={(e) => e.stopPropagation()}
      >
        <li>
          <h6 className="dropdown-header">10학년</h6>
        </li>
        {renderClassOptions(classOptions, "10", viewedClass, handleClassSelect)}

        <li>
          <div className="dropdown-divider"></div>
        </li>
        <li>
          <h6 className="dropdown-header">11학년</h6>
        </li>
        {renderClassOptions(classOptions, "11", viewedClass, handleClassSelect)}

        <li><div className="dropdown-divider"></div></li>
        <li><h6 className="dropdown-header">12학년</h6></li>
        {renderClassOptions(classOptions, "12", viewedClass, handleClassSelect)}
      </ul>
    </div>
  );
}

function renderClassOptions(classOptions, grade, viewedClass, onSelect) {
  return classOptions
    .filter((option) => option.grade === grade)
    .map((option) => (
      <li key={option.id}>
        <button
          className={`dropdown-item ${
            viewedClass === option.id ? "active" : ""
          }`}
          onClick={(e) => onSelect(option.id, e)}
        >
          {option.name}
        </button>
      </li>
    ));
}
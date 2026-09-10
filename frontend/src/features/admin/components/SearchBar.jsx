import React from "react";
import { useState } from "react";
import "../styles/Admin.css";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch(""); // Reset to show all records
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search by Participant ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {query && (
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <button type="submit" className="search-btn">
        Search
      </button>
    </form>
  );
}

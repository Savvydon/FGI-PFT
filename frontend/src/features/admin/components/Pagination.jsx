import React from "react";
import "../styles/Admin.css";

export default function Pagination({ page, setPage, totalPages }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="page-btn">Previous</button>
      <span>Page {page.toLocaleString()} of {totalPages.toLocaleString()}</span>
      <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="page-btn">Next</button>
    </div>
  );
}

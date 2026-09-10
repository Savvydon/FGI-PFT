import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Admin.css";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button - only visible on small screens */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Overlay - closes sidebar when clicked */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <h3>Admin Panel</h3>
        <nav>
          <Link to="/admin/dashboard" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link to="/admin/analytics" onClick={() => setIsOpen(false)}>
            Analytics
          </Link>
          <Link to="/admin/personnel" onClick={() => setIsOpen(false)}>
            Personnel Records
          </Link>
        </nav>
      </div>
    </>
  );
}

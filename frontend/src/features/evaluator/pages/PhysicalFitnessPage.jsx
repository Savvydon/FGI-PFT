import { API_BASE } from "../../../config/env.js";
import { usePhysicalFitness } from "../hooks/usePhysicalFitness";
import { PhysicalFitnessForm } from "../components/PhysicalFitnessForm";
import React from "react";
import { useAuth } from "../../../app/providers/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";
import fgiLogo from "../../../assets/fgiLogo.svg";
import "../../../styles/PhysicalFitness.css";



export default function PhysicalFitnessPage() {
  const { formData, handleChange, handleSubmit, titles } = usePhysicalFitness();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    logout();
    navigate("/login");
  };

  return (
    <div className="page">
      <div
        className="form-container"
        style={{ position: "relative", paddingTop: "40px" }}
      >
        {/* Logout button top-right */}
        <button
          onClick={handleLogout}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "8px 16px",
            background: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Logout
        </button>

        {/* Logo */}
        
        <div className="brand-logo-container">
          <img src={fgiLogo} alt="FGI Logo" className="brand-logo-img" />
        </div>

        {/* <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img src={fgiLogo} alt="FGI Logo" style={{ height: "60px" }} />
        </div> */}

        {/* Title */}
        <h1
          style={{
            textAlign: "center",
            fontSize: "1.2rem",
            marginBottom: "30px",
          }}
        >
          NIGERIAN AIR FORCE ANNUAL PHYSICAL FITNESS TEST INTERPRETATION FORM
        </h1>

        {/* Physical Fitness Form */}
        <PhysicalFitnessForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          titles={titles}
        />

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "30px" }}>
          &copy; {new Date().getFullYear()} Nigeria Air Force – Official Use
          Only
        </p>
      </div>
    </div>
  );
}

import { API_BASE } from "../../../config/env.js";
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnalyticsChart from "../../analytics/components/AnalyticsCharts.jsx";
import "../styles/superadmin.css";



export default function AnalyticsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/superadmin/pft-results`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch results");

      const results = await res.json();
      setData(results);
      setError(null);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-container">
      <div className="page-header">
        <h2>Super Admin Analytics</h2>
        <button
          onClick={() => navigate("/superadmin/dashboard")}
          className="back-btn"
        >
          ← Back to Dashboard
        </button>
      </div>

      <p className="page-description">
        Comprehensive analytics across all PFT records system-wide
      </p>

      {loading ? (
        <div className="loading">Loading analytics data...</div>
      ) : error ? (
        <div className="error">
          <p>Error loading data: {error}</p>
          <button onClick={loadData} className="submit-btn">
            Retry
          </button>
        </div>
      ) : (
        <AnalyticsChart data={data} userRole="super_admin" />
      )}
    </div>
  );
}

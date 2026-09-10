import React from "react";
import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader.jsx";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AnalyticsChart from "../../analytics/components/AnalyticsCharts.jsx";
import { getAllPersonnel } from "../services/adminApi.js";
import "../styles/Admin.css";

export default function Analytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Admin gets all PFT results within their scope
      const results = await getAllPersonnel();
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
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminHeader />

        <div className="analytics-page-header">
          <h3>Analytics Dashboard</h3>
          <p>Comprehensive overview of Physical Fitness Test data</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <p>Loading analytics data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>Error loading data: {error}</p>
            <button onClick={loadData}>Retry</button>
          </div>
        ) : (
          <AnalyticsChart data={data} userRole="admin" />
        )}
      </div>
    </div>
  );
}

import { API_BASE } from "../../../config/env.js";
import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/superadmin.css";



export default function EvaluatorDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("pft_token");

  useEffect(() => {
    fetchDetails();
    fetchAdmins();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/superadmin/evaluators/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch (status ${res.status})`);
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    }
  };

  const handleUnassign = async () => {
    if (!window.confirm("Remove this evaluator from their current admin?")) return;

    try {
      setAssigning(true);
      const res = await fetch(`${API_BASE}/superadmin/unassign-evaluator/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Unassignment failed");
      }

      setActionMsg("Evaluator unassigned successfully!");
      fetchDetails();
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      setActionMsg("Error: " + err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleReassign = async (adminId) => {
    if (!adminId) return;
    if (!window.confirm("Reassign this evaluator to the selected admin?")) return;

    try {
      setAssigning(true);
      const res = await fetch(`${API_BASE}/superadmin/assign-evaluator`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ evaluator_id: parseInt(id), admin_id: parseInt(adminId) })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Reassignment failed");
      }

      setActionMsg("Evaluator reassigned successfully!");
      fetchDetails();
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      setActionMsg("Error: " + err.message);
    } finally {
      setAssigning(false);
    }
  };

  // ============ PRINT FUNCTION (FIXED: No about:blank) ============
  const handlePrint = () => {
    const evaluator = data?.evaluator || {};
    const assignedAdmin = data?.assigned_admin || null;
    const evaluations = data?.evaluations || [];

    // Create a hidden iframe for printing (avoids about:blank)
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Evaluator Report - ${evaluator.full_name || "Unknown"}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
            /* Hide default browser headers/footers */
            @bottom-left { content: normal; }
            @bottom-center { content: normal; }
            @bottom-right { content: normal; }
            @top-left { content: normal; }
            @top-center { content: normal; }
            @top-right { content: normal; }
          }
          * { box-sizing: border-box; }
          body {
            font-family: "Times New Roman", Georgia, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            margin: 0;
            padding: 20px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .header h1 {
            font-size: 18pt;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .header p {
            font-size: 10pt;
            margin: 2px 0;
            color: #333;
          }
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            margin: 20px 0 10px 0;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 30px;
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px dotted #ccc;
          }
          .info-label { font-weight: bold; }
          .info-value { text-align: right; }
          .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 10pt;
            font-weight: bold;
          }
          .badge-active { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
          .badge-zero { background: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 10pt;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #f0f0f0;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9pt;
          }
          tr:nth-child(even) { background: #fafafa; }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 9pt;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 15px;
          }
          .print-date {
            text-align: right;
            font-size: 9pt;
            color: #666;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="print-date">Printed on: ${new Date().toLocaleString()}</div>

        <div class="header">
          <h1>NAF Physical Fitness Test System</h1>
          <p>Evaluator Performance Report</p>
          <p>Confidential Document</p>
        </div>

        <div class="section-title">Evaluator Information</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Full Name:</span>
            <span class="info-value">${evaluator.full_name || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email Address:</span>
            <span class="info-value">${evaluator.email || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Title:</span>
            <span class="info-value">${evaluator.title || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Evaluations:</span>
            <span class="info-value">${data?.evaluations_count || 0}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Assigned Admin:</span>
            <span class="info-value">
              ${assignedAdmin 
                ? `${assignedAdmin.full_name} (${assignedAdmin.title})` 
                : '<span class="badge badge-zero">Not Assigned</span>'}
            </span>
          </div>
        </div>

        <div class="section-title">Evaluation History</div>
        ${evaluations.length === 0 
          ? '<p style="text-align:center; color:#666; padding:20px;">No evaluations recorded yet.</p>'
          : `
            <table>
              <thead>
                <tr>
                  <th style="width:5%">S/N</th>
                  <th style="width:15%">Email</th>
                  <th style="width:20%">Name</th>
                  <th style="width:15%">Title</th>
                  <th style="width:15%">Unit</th>
                  <th style="width:10%">Year</th>
                  <th style="width:10%">Grade</th>
                  <th style="width:10%">Date</th>
                </tr>
              </thead>
              <tbody>
                ${evaluations.map((eval_item, index) => `
                  <tr>
                    <td style="text-align:center"><strong>${index + 1}</strong></td>
                    <td>${eval_item.email || "N/A"}</td>
                    <td>${eval_item.full_name || "N/A"}</td>
                    <td>${eval_item.title || "N/A"}</td>
                    <td>${eval_item.unit || "N/A"}</td>
                    <td>${eval_item.year || "N/A"}</td>
                    <td>${eval_item.grade || "N/A"}</td>
                    <td>${eval_item.created_at ? new Date(eval_item.created_at).toLocaleDateString() : "N/A"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `
        }

        <div class="footer">
          <p><strong>Nigerian Air Force</strong> — Physical Fitness Test System</p>
          <p>This document is confidential and intended for authorized personnel only.</p>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </body>
      </html>
    `;

    iframeDoc.write(printContent);
    iframeDoc.close();

    // Wait for content to load then print
    iframe.onload = function() {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data) return <div className="not-found">Evaluator not found</div>;

  const evaluator = data.evaluator || {};
  const assignedAdmin = data.assigned_admin || null;
  const evaluations = data.evaluations || [];

  const availableAdmins = admins.filter(a => a.id !== assignedAdmin?.id);

  return (
    <div className="superadmin-container">
      {/* Print Button */}
      <div style={{ textAlign: "right", marginBottom: "15px" }}>
        <button
          onClick={handlePrint}
          style={{
            padding: "10px 20px",
            background: "#0b3d91",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
           Print Report
        </button>
      </div>

      <h2>Evaluator Details</h2>

      {/* Action Message */}
      {actionMsg && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "6px",
            background: actionMsg.startsWith("Error") ? "#f8d7da" : "#d4edda",
            color: actionMsg.startsWith("Error") ? "#721c24" : "#155724",
            border: `1px solid ${actionMsg.startsWith("Error") ? "#f5c6cb" : "#c3e6cb"}`,
          }}
        >
          {actionMsg}
        </div>
      )}

      <div className="details-card">
        <h3>{evaluator.full_name || "Unknown"}</h3>
        <p><strong>Email Address:</strong> {evaluator.email || "N/A"}</p>
        <p><strong>Title:</strong> {evaluator.title || "N/A"}</p>
        <p><strong>Total Evaluations:</strong> {data.evaluations_count || 0}</p>

        {/* Assigned Admin Info */}
        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #ddd" }}>
          <p><strong>Assigned Admin:</strong></p>
          {assignedAdmin ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span className="badge active">
                {assignedAdmin.full_name} ({assignedAdmin.title}) — {assignedAdmin.email}
              </span>
              <button
                onClick={handleUnassign}
                disabled={assigning}
                className="delete-btn"
                style={{ padding: "6px 12px", fontSize: "0.85rem" }}
              >
                {assigning ? "Processing..." : "✕ Cancel Assignment"}
              </button>
            </div>
          ) : (
            <div>
              <span className="badge zero" style={{ marginRight: "10px" }}>
                Not Assigned
              </span>
            </div>
          )}
        </div>

        {/* Reassign Section */}
        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #ddd" }}>
          <p><strong>Reassign to Another Admin:</strong></p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
            <select
              onChange={(e) => handleReassign(e.target.value)}
              disabled={assigning || availableAdmins.length === 0}
              defaultValue=""
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: "0.95rem",
                minWidth: "250px",
              }}
            >
              <option value="">
                {availableAdmins.length === 0
                  ? "No other admins available"
                  : "-- Select New Admin --"}
              </option>
              {availableAdmins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.full_name} ({admin.title}) — {admin.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <h3>Evaluation History</h3>
      {evaluations.length === 0 ? (
        <p>No evaluations recorded yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Email</th>
              <th>Name</th>
              <th>Title</th>
              <th>Unit</th>
              <th>Year</th>
              <th>Grade</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((eval_item, index) => (
              <tr key={eval_item.id}>
                <td><strong>{index + 1}</strong></td>
                <td>{eval_item.email}</td>
                <td>{eval_item.full_name}</td>
                <td>{eval_item.title || "N/A"}</td>
                <td>{eval_item.unit || "N/A"}</td>
                <td>{eval_item.year}</td>
                <td>{eval_item.grade}</td>
                <td>{new Date(eval_item.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={() => navigate("/superadmin/evaluators")} className="back-btn">
        ← Back to Evaluators
      </button>
    </div>
  );
}

import { API_BASE } from "../../../config/env.js";
import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/superadmin.css";



export default function AdminDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/superadmin/admins/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Failed to fetch (status ${res.status})`,
        );
      }

      const result = await res.json();
      console.log("Admin details fetched:", result);
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============ PRINT FUNCTION (iframe approach — no about:blank) ============
  const handlePrint = () => {
    const admin = data?.admin || {};
    const assignedEvaluators = data?.assigned_evaluators || [];
    const certificates = data?.certificates || [];
    const certificatesCount = data?.certificates_count || certificates.length || 0;
    const evaluatorsCount = assignedEvaluators.length || 0;

    // Create hidden iframe
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
        <title>Admin Report - ${admin.full_name || "Unknown"}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
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
            margin-bottom: 25px;
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
          .status-fit { background: #d4edda; color: #155724; }
          .status-notfit { background: #f8d7da; color: #721c24; }
          .status-excused { background: #fff3cd; color: #856404; }
        </style>
      </head>
      <body>
        <div class="print-date">Printed on: ${new Date().toLocaleString()}</div>

        <div class="header">
          <h1>NAF Physical Fitness Test System</h1>
          <p>Admin Performance Report</p>
          <p>Confidential Document</p>
        </div>

        <div class="section-title">Admin Information</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Full Name:</span>
            <span class="info-value">${admin.full_name || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email Address:</span>
            <span class="info-value">${admin.email || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Title:</span>
            <span class="info-value">${admin.title || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Role:</span>
            <span class="info-value">${admin.role || "admin"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Certificates Issued:</span>
            <span class="info-value">
              <span class="badge ${certificatesCount > 0 ? 'badge-active' : 'badge-zero'}">${certificatesCount}</span>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Assigned Evaluators:</span>
            <span class="info-value">
              <span class="badge ${evaluatorsCount > 0 ? 'badge-active' : 'badge-zero'}">${evaluatorsCount}</span>
            </span>
          </div>
        </div>

        <div class="section-title">Assigned Evaluators</div>
        ${assignedEvaluators.length === 0 
          ? '<p style="text-align:center; color:#666; padding:15px;">No evaluators assigned to this admin yet.</p>'
          : `
            <table>
              <thead>
                <tr>
                  <th style="width:10%">S/N</th>
                  <th style="width:35%">Full Name</th>
                  <th style="width:30%">Email Address</th>
                  <th style="width:25%">Title</th>
                </tr>
              </thead>
              <tbody>
                ${assignedEvaluators.map((ev, index) => `
                  <tr>
                    <td style="text-align:center"><strong>${index + 1}</strong></td>
                    <td>${ev.full_name || "N/A"}</td>
                    <td>${ev.email || "N/A"}</td>
                    <td>${ev.title || "N/A"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `
        }

        <div class="section-title">Certificates Issued History</div>
        ${certificates.length === 0 
          ? '<p style="text-align:center; color:#666; padding:15px;">No certificates issued yet.</p>'
          : `
            <table>
              <thead>
                <tr>
                  <th style="width:5%">S/N</th>
                  <th style="width:18%">Certificate No</th>
                  <th style="width:18%">Personnel Name</th>
                  <th style="width:12%">Participant ID</th>
                  <th style="width:12%">Title</th>
                  <th style="width:12%">Unit</th>
                  <th style="width:10%">Status</th>
                  <th style="width:13%">Date Issued</th>
                </tr>
              </thead>
              <tbody>
                ${certificates.map((cert, index) => `
                  <tr>
                    <td style="text-align:center"><strong>${index + 1}</strong></td>
                    <td>${cert.certificate_number || "N/A"}</td>
                    <td>${cert.personnel_name || "N/A"}</td>
                    <td>${cert.personnel_participant_id || "N/A"}</td>
                    <td>${cert.personnel_title || "N/A"}</td>
                    <td>${cert.personnel_unit || "N/A"}</td>
                    <td>
                      <span class="badge status-${(cert.status || "issued").toLowerCase().replace(/\s/g, "")}">
                        ${cert.status || "Issued"}
                      </span>
                    </td>
                    <td>${cert.created_at ? new Date(cert.created_at).toLocaleDateString() : "N/A"}</td>
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

    iframe.onload = function() {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data) return <div className="not-found">Admin not found</div>;

  // FIXED: Ensure arrays exist
  const certificates = data.certificates || [];
  const assignedEvaluators = data.assigned_evaluators || [];
  const certificatesCount = data.certificates_count || certificates.length || 0;
  const evaluatorsCount = assignedEvaluators.length || 0;

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

      <h2>Admin Details</h2>

      {/* Admin Info Card */}
      <div className="details-card">
        <h3>{data.admin?.full_name || "Unknown"}</h3>
        <p>
          <strong>Email Address:</strong> {data.admin?.email || "N/A"}
        </p>
        <p>
          <strong>Title:</strong> {data.admin?.title || "N/A"}
        </p>
        <p>
          <strong>Role:</strong> {data.admin?.role || "admin"}
        </p>
        <p>
          <strong>Total Certificates Issued:</strong>
          <span
            className={`badge ${certificatesCount > 0 ? "active" : "zero"}`}
            style={{ marginLeft: "10px" }}
          >
            {certificatesCount}
          </span>
        </p>
        {/* Assigned Evaluators Count */}
        <p>
          <strong>Assigned Evaluators:</strong>
          <span
            className={`badge ${evaluatorsCount > 0 ? "active" : "zero"}`}
            style={{ marginLeft: "10px" }}
          >
            {evaluatorsCount}
          </span>
        </p>
      </div>

      {/* Assigned Evaluators Section */}
      <h3>Assigned Evaluators</h3>
      {assignedEvaluators.length === 0 ? (
        <div className="empty-state">
          <p>No evaluators assigned to this admin yet.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {assignedEvaluators.map((ev, index) => (
              <tr key={ev.id}>
                <td>
                  <strong>{index + 1}</strong>
                </td>
                <td>{ev.full_name || "N/A"}</td>
                <td>{ev.email || "N/A"}</td>
                <td>{ev.title || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Certificates Issued History */}
      <h3>Certificates Issued History</h3>
      {certificates.length === 0 ? (
        <div className="empty-state">
          <p>No certificates issued yet.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Certificate No</th>
              <th>Personnel Name</th>
              <th>Participant ID</th>
              <th>Title</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Date Issued</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert, index) => (
              <tr key={cert.id}>
                <td>
                  <strong>{index + 1}</strong>
                </td>
                <td>{cert.certificate_number || "N/A"}</td>
                <td>{cert.personnel_name || "N/A"}</td>
                <td>{cert.personnel_participant_id || "N/A"}</td>
                <td>{cert.personnel_title || "N/A"}</td>
                <td>{cert.personnel_unit || "N/A"}</td>
                <td>
                  <span
                    className={`status-badge ${cert.status?.toLowerCase().replace(" ", "") || "issued"}`}
                  >
                    {cert.status || "Issued"}
                  </span>
                </td>
                <td>
                  {cert.created_at
                    ? new Date(cert.created_at).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => navigate("/superadmin/admins")}
        className="back-btn"
      >
        ← Back to Admins
      </button>
    </div>
  );
}
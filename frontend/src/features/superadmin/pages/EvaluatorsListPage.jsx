import { PERSON_TITLES } from "../../../constants/titles.js";
import { API_BASE } from "../../../config/env.js";
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/superadmin.css";




export default function EvaluatorsListPage() {
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: "", title: "", email: "" });
  const [savingId, setSavingId] = useState(null);
  const [statusId, setStatusId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvaluators();
  }, []);

  const fetchEvaluators = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/superadmin/evaluators`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.detail || "Failed to fetch evaluators");
      setEvaluators(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (evaluator) => {
    setEditingId(evaluator.id);
    setEditForm({
      full_name: evaluator.full_name || "",
      title: evaluator.title || "",
      email: evaluator.email || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ full_name: "", title: "", email: "" });
  };

  const saveEdit = async (id) => {
    if (!editForm.full_name.trim() || !editForm.title.trim() || !editForm.email.trim()) {
      alert("Name, title and email address are required.");
      return;
    }

    try {
      setSavingId(id);
      const res = await fetch(`${API_BASE}/superadmin/evaluators/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: editForm.full_name.trim(),
          title: editForm.title.trim(),
          email: editForm.email.trim().toLowerCase()
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to update evaluator");

      setEvaluators((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
      cancelEdit();
      alert("Evaluator details updated successfully.");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const toggleStatus = async (evaluator) => {
    const action = evaluator.is_active ? "make this evaluator ineligible" : "make this evaluator eligible";
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    try {
      setStatusId(evaluator.id);
      const res = await fetch(`${API_BASE}/superadmin/evaluators/${evaluator.id}/toggle-status`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to change evaluator status");

      setEvaluators((prev) =>
        prev.map((item) => (item.id === evaluator.id ? { ...item, is_active: data.is_active } : item)),
      );
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setStatusId(null);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete evaluator ${email}? Historical records should normally be preserved by making the evaluator ineligible instead.`)) return;

    try {
      const res = await fetch(`${API_BASE}/superadmin/evaluators/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Delete failed");

      setEvaluators((prev) => prev.filter((e) => e.id !== id));
      alert("Evaluator deleted successfully");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const viewDetails = (id) => navigate(`/superadmin/evaluators/${id}`);

  if (loading) return <div className="loading">Loading evaluators...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="superadmin-container">
      <div className="page-header">
        <h2>Evaluators Management</h2>
        <button onClick={() => navigate("/superadmin/evaluators/create")} className="create-btn">
          + Create Evaluator
        </button>
      </div>

      <p style={{ marginBottom: "16px", color: "#555" }}>
        Reassigning an evaluator changes only where <strong>new</strong> work is stored. Historical PFT records remain with the admin recorded when they were created.
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Title</th>
            <th>Email Address</th>
            {/* <th>Current Admin</th> */}
            <th>Status</th>
            <th>Evaluations Done</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {evaluators.map((evaluator) => (
            <tr key={evaluator.id}>
              {editingId === evaluator.id ? (
                <>
                  <td>
                    <input
                      value={editForm.full_name}
                      onChange={(e) => setEditForm((p) => ({ ...p, full_name: e.target.value }))}
                    />
                  </td>
                  <td>
                    <select
                      value={editForm.title}
                      onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                    >
                      <option value="">Select Title</option>
                      {PERSON_TITLES.map((title) => <option key={title} value={title}>{title}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      value={editForm.email}
                      onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    />
                  </td>
                </>
              ) : (
                <>
                  <td>{evaluator.full_name}</td>
                  <td>{evaluator.title}</td>
                  <td>{evaluator.email}</td>
                </>
              )}

              {/* <td>{evaluator.assigned_admin_name || "Unassigned"}</td> */}
              <td>
                <span
                  className={`badge ${evaluator.is_active ? "active" : "zero"}`}
                  style={{ background: evaluator.is_active ? "#d4edda" : "#f8d7da", color: evaluator.is_active ? "#155724" : "#721c24" }}
                >
                  {evaluator.is_active ? "Eligible" : "Ineligible"}
                </span>
              </td>
              <td>
                <span className={`badge ${evaluator.evaluations_count > 0 ? "active" : "zero"}`}>
                  {evaluator.evaluations_count}
                </span>
              </td>
              <td className="actions">
                {editingId === evaluator.id ? (
                  <>
                    <button onClick={() => saveEdit(evaluator.id)} className="view-btn" disabled={savingId === evaluator.id}>
                      {savingId === evaluator.id ? "Saving..." : "Save"}
                    </button>
                    <button onClick={cancelEdit} className="back-btn" disabled={savingId === evaluator.id}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => viewDetails(evaluator.id)} className="view-btn">View</button>
                    <button onClick={() => startEdit(evaluator)} className="view-btn">Edit</button>
                    <button
                      onClick={() => toggleStatus(evaluator)}
                      className="view-btn"
                      disabled={statusId === evaluator.id}
                      style={{ background: evaluator.is_active ? "#dc3545" : "#28a745" }}
                    >
                      {statusId === evaluator.id ? "Updating..." : evaluator.is_active ? "Make Ineligible" : "Make Eligible"}
                    </button>
                    <button onClick={() => handleDelete(evaluator.id, evaluator.email)} className="delete-btn">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => navigate("/superadmin/dashboard")} className="back-btn">
        ← Back to Dashboard
      </button>
    </div>
  );
}

import { PERSON_TITLES } from "../../../constants/titles.js";
import { API_BASE } from "../../../config/env.js";
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/superadmin.css";




export default function AdminsListPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: "", title: "", email: "" });
  const [savingId, setSavingId] = useState(null);
  const [statusId, setStatusId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/superadmin/admins`, {
        credentials: "include",
      });

      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.detail || "Failed to fetch admins");

      setAdmins(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (admin) => {
    setEditingId(admin.id);
    setEditForm({
      full_name: admin.full_name || "",
      title: admin.title || "",
      email: admin.email || "",
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
      const res = await fetch(`${API_BASE}/superadmin/admins/${id}`, {
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
      if (!res.ok) throw new Error(data.detail || "Failed to update admin");

      setAdmins((prev) => prev.map((admin) => (admin.id === id ? { ...admin, ...data } : admin)));
      cancelEdit();
      alert("Admin details updated successfully.");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const toggleStatus = async (admin) => {
    const action = admin.is_active ? "make this admin ineligible" : "make this admin eligible";
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    try {
      setStatusId(admin.id);
      const res = await fetch(`${API_BASE}/superadmin/admins/${admin.id}/toggle-status`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to change admin status");

      setAdmins((prev) =>
        prev.map((item) => (item.id === admin.id ? { ...item, is_active: data.is_active } : item)),
      );
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setStatusId(null);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete admin ${email}? Historical records should normally be preserved by making the admin ineligible instead.`)) return;

    try {
      const res = await fetch(`${API_BASE}/superadmin/admins/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Delete failed");

      setAdmins((prev) => prev.filter((a) => a.id !== id));
      alert("Admin deleted successfully");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const viewDetails = (id) => navigate(`/superadmin/admins/${id}`);

  if (loading) return <div className="loading">Loading admins...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="superadmin-container">
      <div className="page-header">
        <h2>Admins Management</h2>
        <button onClick={() => navigate("/superadmin/admins/create")} className="create-btn">
          + Create Admin
        </button>
      </div>

      <p style={{ marginBottom: "16px", color: "#555" }}>
        <strong>Eligible</strong> accounts can log in. <strong>Ineligible</strong> accounts cannot access the system.
        Changing an admin's name or title does not rewrite historical certificates or PFT ownership records.
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Title</th>
            <th>Email Address</th>
            <th>Status</th>
            <th>Certificates Issued</th>
            <th>Assigned Evaluators</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              {editingId === admin.id ? (
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
                  <td>{admin.full_name}</td>
                  <td>{admin.title}</td>
                  <td>{admin.email}</td>
                </>
              )}

              <td>
                <span
                  className={`badge ${admin.is_active ? "active" : "zero"}`}
                  style={{ background: admin.is_active ? "#d4edda" : "#f8d7da", color: admin.is_active ? "#155724" : "#721c24" }}
                >
                  {admin.is_active ? "Eligible" : "Ineligible"}
                </span>
              </td>
              <td>
                <span className={`badge ${admin.certificates_count > 0 ? "active" : "zero"}`}>
                  {admin.certificates_count || 0}
                </span>
              </td>
              <td>{admin.assigned_evaluators_count || 0}</td>
              <td className="actions">
                {editingId === admin.id ? (
                  <>
                    <button onClick={() => saveEdit(admin.id)} className="view-btn" disabled={savingId === admin.id}>
                      {savingId === admin.id ? "Saving..." : "Save"}
                    </button>
                    <button onClick={cancelEdit} className="back-btn" disabled={savingId === admin.id}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => viewDetails(admin.id)} className="view-btn">View</button>
                    <button onClick={() => startEdit(admin)} className="view-btn">Edit</button>
                    <button
                      onClick={() => toggleStatus(admin)}
                      className="view-btn"
                      disabled={statusId === admin.id}
                      style={{ background: admin.is_active ? "#dc3545" : "#28a745" }}
                    >
                      {statusId === admin.id ? "Updating..." : admin.is_active ? "Make Ineligible" : "Make Eligible"}
                    </button>
                    <button onClick={() => handleDelete(admin.id, admin.email)} className="delete-btn">Delete</button>
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

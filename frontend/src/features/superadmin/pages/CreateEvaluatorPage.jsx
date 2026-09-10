import { PERSON_TITLES } from "../../../constants/titles.js";
import { API_BASE } from "../../../config/env.js";
import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/superadmin.css";



export default function CreateEvaluatorPage() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    title: "",
    otherTitle: "",
    password: "",
    confirm_password: "",
    assigned_admin_id: "", // NEW: Admin assignment
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
    

  // Fetch admins for dropdown
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/admins`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title" && value !== "Other"
        ? { otherTitle: "" }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.title === "Other" && !formData.otherTitle.trim()) {
      setError("Please enter the title.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        full_name: formData.full_name.trim(),
        title: (formData.title === "Other" ? formData.otherTitle : formData.title).trim(),
        password: formData.password,
        role: "evaluator",
        assigned_admin_id: formData.assigned_admin_id
          ? parseInt(formData.assigned_admin_id)
          : null,
      };

      const res = await fetch(`${API_BASE}/superadmin/evaluators`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to create evaluator");
      }

      alert(
        `Evaluator created successfully!\n\n` +
          `Name: ${data.full_name}\n` +
          `Email: ${data.email}\n` +
          `Title: ${data.title}\n` +
          `Assigned Admin: ${
            data.assigned_admin_id
              ? admins.find((a) => a.id === data.assigned_admin_id)?.full_name ||
                "Admin ID " + data.assigned_admin_id
              : "None (unassigned)"
          }`
      );

      navigate("/superadmin/evaluators");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-container">
      <h2>Create New Evaluator</h2>

      {error && (
        <div
          style={{
            background: "#f8d7da",
            color: "#721c24",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. NAF/26/10102"
            required
          />
        </div>

        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label>Title *</label>
          <select
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          >
            <option value="">Select Title</option>
            {PERSON_TITLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {formData.title === "Other" && (
            <input
              type="text"
              name="otherTitle"
              value={formData.otherTitle}
              onChange={handleChange}
              placeholder="Enter title"
              required
              style={{ marginTop: "8px" }}
            />
          )}
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Re-enter password"
            required
          />
        </div>

        {/* NEW: Admin Assignment Dropdown */}
        <div className="form-group">
          <label>Assign to Admin (Optional)</label>
          <select
            name="assigned_admin_id"
            value={formData.assigned_admin_id}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "1rem",
            }}
          >
            <option value="">-- Select an Admin --</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.full_name} ({admin.title}) - {admin.email}
              </option>
            ))}
          </select>
          <small style={{ color: "#6c757d", display: "block", marginTop: "4px" }}>
            If left unselected, the evaluator will not be assigned to any admin yet.
            You can assign later from the Evaluators List.
          </small>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="create-btn"
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: loading ? "#aaa" : "#0b3d91",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
            }}
          >
            {loading ? "Creating..." : "Create Evaluator"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/superadmin/evaluators")}
            className="cancel-btn"
            style={{
              padding: "12px 24px",
              background: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1rem",
              marginLeft: "10px",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

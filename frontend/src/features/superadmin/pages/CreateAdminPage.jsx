import { PERSON_TITLES } from "../../../constants/titles.js";
import { API_BASE } from "../../../config/env.js";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/superadmin.css";



export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    title: "",
    otherTitle: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ** I stopped the auto filling of "NAF"**
    //if (name === "email") {
    //   let cleaned = value.toUpperCase().replace(/[^A-Z0-9/]/g, "");
    //   if (!cleaned.startsWith("NAF")) cleaned = "NAF" + cleaned;
    //   setFormData((prev) => ({ ...prev, [name]: cleaned }));
    //   return;
    // }

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
      const res = await fetch(`${API_BASE}/superadmin/admins`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          title: (formData.title === "Other" ? formData.otherTitle : formData.title).trim(),
          password: formData.password,
          role: "admin",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to create admin");
      }

      alert("Admin created successfully!");
      navigate("/superadmin/admins");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-container">
      <h2>Create New Admin</h2>

      <form onSubmit={handleSubmit} className="create-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Title</label>
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
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/superadmin/admins")}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </div>
      </form>
    </div>
  );
}

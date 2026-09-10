// import { useState } from "react";
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../../app/providers/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../services/api.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsBusy(true);

    try {
      const data = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      // Save token and redirect based on role
      login(data.access_token, {
        role: data.role,
        full_name: data.full_name,
        title: data.title,
        email: email.trim().toLowerCase(),
      });

      if (data.role === "super_admin") {
        navigate("/superadmin/dashboard");
      } else if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/"); // Evaluator landing page
      }
    } catch (err) {
      let message = err.message || "Authentication failed";

      if (message.includes("not registered")) {
        message =
          "Email address not found. Please contact your Super Admin to create an account.";
      } else if (message.includes("Incorrect password")) {
        message = "Incorrect password.";
      }

      setErrorMsg(message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "120px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "28px" }}>
        NAF PFT Evaluator Login
      </h2>

      <form onSubmit={handleLogin}>
        {/* Email Address */}
        <div style={{ marginBottom: "16px" }}>
          <label>Email Address</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        {/* Password with show/hide toggle */}
        <div style={{ marginBottom: "16px", position: "relative" }}>
          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", paddingRight: "60px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "47%",
              padding: "4px 8px",
              border: "none",
              background: "transparent",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.85em",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <p
            style={{
              color: "red",
              marginBottom: "10px",
              fontSize: "0.9em",
            }}
          >
            {errorMsg}
          </p>
        )}

        {/* Login button */}
        <button
          type="submit"
          disabled={isBusy}
          style={{
            width: "100%",
            padding: "12px",
            background: isBusy ? "#aaa" : "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: isBusy ? "not-allowed" : "pointer",
          }}
        >
          {isBusy ? "Authenticating..." : "Login"}
        </button>
      </form>

      {/* Links */}
      <p
        style={{
          marginTop: "20px",
          fontSize: "0.85em",
          color: "#666",
          textAlign: "center",
        }}
      >
        <a href="/admin/login" style={{ color: "#0d6efd" }}>
          Admin Login
        </a>{" "}
        |
        <a
          href="/superadmin/login"
          style={{ color: "#0d6efd", marginLeft: "10px" }}
        >
          Super Admin Login
        </a>
      </p>
    </div>
  );
}

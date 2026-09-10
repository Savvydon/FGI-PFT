// import { useState } from "react";
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../../app/providers/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/adminApi.js";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsBusy(true);

    try {
      console.log("[LOGIN] Starting admin login...");

      const data = await loginAdmin({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log(
        "[LOGIN] Success, token received:",
        data.access_token ? "YES" : "NO",
      );
      console.log("[LOGIN] Role:", data.role);

      // Save token before navigating
      login(data.access_token, {
        role: data.role,
        full_name: data.full_name,
        title: data.title,
      });

      console.log("[LOGIN] Token saved, navigating to dashboard...");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("[LOGIN ERROR]", err);
      setErrorMsg(err.message || "Authentication failed");
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
      <h2
        style={{ textAlign: "center", marginBottom: "28px", color: "#198754" }}
      >
        FGI PFT Admin Login
      </h2>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontWeight: "600" }}>Email Address</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        <div style={{ marginBottom: "16px", position: "relative" }}>
          <label style={{ fontWeight: "600" }}>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px 40px 10px 10px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "70%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              color: "#198754",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              color: "#dc3545",
              marginBottom: "15px",
              padding: "10px",
              background: "#f8d7da",
              borderRadius: "4px",
            }}
          >
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy}
          style={{
            width: "100%",
            padding: "12px",
            background: isBusy ? "#aaa" : "#198754",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: isBusy ? "not-allowed" : "pointer",
          }}
        >
          {isBusy ? "Authenticating..." : "Admin Login"}
        </button>
      </form>

      <p
        style={{
          marginTop: "20px",
          fontSize: "0.85em",
          color: "#666",
          textAlign: "center",
        }}
      >
        <a href="/login" style={{ color: "#0d6efd" }}>
          Evaluator Login
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

import { API_BASE } from "../../../config/env.js";
import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import fgiLogo from "../../../assets/fgiLogo.svg";
import seal from "../../../assets/seal.png";
import aocSignatureImg from "../../../assets/coaSignature.png";
import sportsSignatureImg from "../../../assets/signature.png";

import "../../../styles/Certificate.css";
import { useAuth } from "../../../app/providers/AuthProvider.jsx";
import {
  createCertificate,
  getCertificateByEvaluation,
  checkCertificateExists,
  updateCertificate,
} from "../../../services/certificates.js";



// Default date values
const getDefaultDate = () => {
  const now = new Date();
  const days = [
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th",
    "12th",
    "13th",
    "14th",
    "15th",
    "16th",
    "17th",
    "18th",
    "19th",
    "20th",
    "21st",
    "22nd",
    "23rd",
    "24th",
    "25th",
    "26th",
    "27th",
    "28th",
    "29th",
    "30th",
    "31st",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return {
    day: days[now.getDate() - 1] || `${now.getDate()}th`,
    month: months[now.getMonth()],
    year: now.getFullYear().toString().slice(-2),
  };
};

export default function CertificatePage({ fromSuperAdmin = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const certRef = useRef(null);
  const { currentUser } = useAuth();

  const fallbackListPath = fromSuperAdmin
    ? "/superadmin/pft-results"
    : "/admin/personnel";

  const returnTo = location.state?.returnTo || fallbackListPath;

  // Core data states
  const [result, setResult] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Form data state - single source of truth
  const [formData, setFormData] = useState({
    titleAndName: "",
    participatedIn: "",
    status: "", // 'fit', 'not fit', 'excused'
    location: "",
    issuedDay: "",
    issuedMonth: "",
    issuedYear: "",
  });

  const isSuperAdmin =
    fromSuperAdmin || location.pathname.includes("/superadmin/");

  // ✅ FIXED: Add proper permission checks
  const canIssueCertificate =
    currentUser?.role === "admin" || currentUser?.role === "super_admin";
  const canEditCertificate =
    currentUser?.role === "admin" || currentUser?.role === "super_admin";
  const canModifyCertificate = canEditCertificate; // Alias for clarity

  const isSaved = !!certificate;

  // Generate watermark array (memoized)
  const watermarkArray = Array.from({ length: 250 }, (_, i) => i);

  // Fetch certificate data
  useEffect(() => {
    let mounted = true;

    const fetchCertificate = async () => {
      try {
        const exists = await checkCertificateExists(id);

        if (exists.exists && mounted) {
          const certDetails = await getCertificateByEvaluation(id);
          setCertificate(certDetails);

          // Populate form with existing data
          setFormData({
            titleAndName:
              `${certDetails.personnel_title || ""} ${certDetails.personnel_name || ""}`.trim(),
            participatedIn: certDetails.participated_in || "",
            status: certDetails.status || "",
            location: certDetails.location || "",
            issuedDay: certDetails.issued_day || "",
            issuedMonth: certDetails.issued_month || "",
            issuedYear: certDetails.issued_year?.slice(-2) || "",
          });
        } else if (mounted) {
          // ✅ FIXED: Auto-enter edit mode for new certificates if user has permission
          const defaultDate = getDefaultDate();
          setFormData((prev) => ({
            ...prev,
            issuedDay: defaultDate.day,
            issuedMonth: defaultDate.month,
            issuedYear: defaultDate.year,
          }));
          // Auto-enable editing for new certs if user can issue
          if (canIssueCertificate) {
            setIsEditing(true);
          }
        }
      } catch (err) {
        console.error("Failed to check certificate:", err);
        // Continue with new certificate flow
      }
    };

    fetchCertificate();
    return () => {
      mounted = false;
    };
  }, [id, canIssueCertificate]);

  // Fetch PFT result
  useEffect(() => {
    const endpoint = isSuperAdmin
      ? `${API_BASE}/superadmin/pft-results/${id}`
      : `${API_BASE}/api/pft-results/${id}`;

    fetch(endpoint, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
        setFormData((prev) => ({
          ...prev,
          titleAndName:
            prev.titleAndName ||
            `${data.title || ""} ${data.full_name || ""}`.trim(),
          // ← NEW: Auto-populate participatedIn with year from PFT result
          participatedIn:
            prev.participatedIn ||
            `Nigerian Air Force Annual Physical Fitness Test ${data.year || new Date().getFullYear()}`,
        }));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load record for certificate");
        setLoading(false);
      });
  }, [id, isSuperAdmin]);

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Validate form
  const validateForm = () => {
    if (!formData.status) {
      alert("Please select a status (Fit, Not Fit, or Excused)");
      return false;
    }
    if (!formData.participatedIn.trim()) {
      alert("Please enter what the personnel participated in");
      return false;
    }
    if (!formData.location.trim()) {
      alert("Please enter the location");
      return false;
    }
    return true;
  };

  // Save new certificate
  const saveNewCertificate = async () => {
    if (!validateForm()) return null;

    setIsSaving(true);

    try {
      const certificateData = {
        evaluation_id: parseInt(id),
        participated_in: formData.participatedIn,
        status: formData.status,
        location: formData.location,
        issued_day: formData.issuedDay,
        issued_month: formData.issuedMonth,
        issued_year: "20" + formData.issuedYear,
      };

      const savedCert = await createCertificate(certificateData);
      setCertificate(savedCert);
      setIsEditing(false);

      // Extract and set certificate number for display
      const numberPart = savedCert.certificate_number.split("HQ")[1];

      alert(
        `Certificate saved successfully!\nNumber: ${savedCert.certificate_number}`,
      );
      return savedCert;
    } catch (err) {
      alert("Failed to save certificate: " + err.message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Update existing certificate
  const updateExistingCertificate = async () => {
    if (!validateForm()) return null;
    if (!certificate) return null;

    setIsSaving(true);

    try {
      const certificateData = {
        participated_in: formData.participatedIn,
        status: formData.status,
        location: formData.location,
        issued_day: formData.issuedDay,
        issued_month: formData.issuedMonth,
        issued_year: "20" + formData.issuedYear,
        // Allow updating personnel info too
        personnel_name: formData.titleAndName.split(" ").slice(1).join(" "),
        personnel_title: formData.titleAndName.split(" ")[0],
      };

      const updatedCert = await updateCertificate(
        certificate.id,
        certificateData,
      );
      setCertificate(updatedCert);
      setIsEditing(false);

      alert(
        `Certificate updated successfully!\nNumber: ${updatedCert.certificate_number}`,
      );
      return updatedCert;
    } catch (err) {
      alert("Failed to update certificate: " + err.message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save/update button
  const handleSaveOrUpdate = async () => {
    if (isSaved) {
      return await updateExistingCertificate();
    } else {
      return await saveNewCertificate();
    }
  };

  // Enable edit mode
  const enableEditMode = () => {
    if (!canEditCertificate) {
      alert("You do not have permission to edit certificates.");
      return;
    }
    setIsEditing(true);
  };

  // Cancel edit - revert to saved data
  const cancelEditMode = () => {
    if (certificate) {
      setFormData({
        titleAndName:
          `${certificate.personnel_title || ""} ${certificate.personnel_name || ""}`.trim(),
        participatedIn: certificate.participated_in || "",
        status: certificate.status || "",
        location: certificate.location || "",
        issuedDay: certificate.issued_day || "",
        issuedMonth: certificate.issued_month || "",
        issuedYear: certificate.issued_year?.slice(-2) || "",
      });
    }
    setIsEditing(false);
  };

  const generatePDF = async () => {
    const input = certRef.current;
    if (!input) return;

    const originalStyles = {
      transform: input.style.transform,
      width: input.style.width,
      maxWidth: input.style.maxWidth,
      height: input.style.height,
      overflow: input.style.overflow,
    };

    try {
      // ✅ Apply PDF mode (CSS handles layout)
      input.classList.add("pdf-mode");

      // ✅ Wait for fonts & layout
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 300));

      // ✅ Capture EXACT size (no forced width/height)
      const canvas = await html2canvas(input, {
        scale: 3, // higher quality
        useCORS: true,
        backgroundColor: "#FAF9F6",
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // ✅ DO NOT over-compress — keep proportions
      pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);

      const certNum =
        certificate?.certificate_number?.split("HQ")[1] || "DRAFT";

      pdf.save(
        `NAF_PFT_Certificate_${result?.participant_id || "PERSONNEL"}_${certNum}.pdf`,
      );
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    } finally {
      input.classList.remove("pdf-mode");
      Object.assign(input.style, originalStyles);
    }
  };

  const sendCertificate = async () => {
    if (!result?.email) {
      alert("No email address found for this personnel.");
      return;
    }

    setIsSending(true);

    const input = certRef.current;
    if (!input) {
      setIsSending(false);
      return;
    }

    try {
      input.classList.add("pdf-mode");

      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 300));

      const canvas = await html2canvas(input, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#FAF9F6",
        scrollX: 0,
        scrollY: 0,
      });

      const pdf = new jsPDF("p", "mm", "a4");

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);

      const pdfBlob = pdf.output("blob");

      if (pdfBlob.size > 4.5 * 1024 * 1024) {
        alert("PDF too large. Please download instead.");
        return;
      }

      const certNum = certificate?.certificate_number || "DRAFT";

      const formDataObj = new FormData();
      formDataObj.append("email", result.email);
      formDataObj.append("file", pdfBlob, `NAF_PFT_Certificate_${certNum}.pdf`);
      formDataObj.append("personnel_name", result.full_name || "");
      formDataObj.append("certificate_type", "pft_certificate");
      formDataObj.append("certificate_number", certNum);

      const res = await fetch(`${API_BASE}/send-certificate-pdf`, {
        method: "POST",
        credentials: "include",
        body: formDataObj,
      });

      if (!res.ok) throw new Error("Failed to send email");

      alert(`Certificate sent successfully to ${result.email}`);
    } catch (err) {
      alert("Failed to send certificate: " + err.message);
    } finally {
      input.classList.remove("pdf-mode");
      setIsSending(false);
    }
  };

  const handleBack = () => {
    navigate(returnTo);
  };

  // Get display status label
  const getStatusLabel = (status) => {
    if (!status) return "";
    const map = {
      fit: "Fit",
      "not fit": "Not Fit",
      not_fit: "Not Fit",
      excused: "Excused",
    };
    return map[status.toLowerCase()] || status;
  };

  if (loading)
    return <div className="loading-text">Loading certificate...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!result) return <div className="error">Record not found</div>;

  const certNumber = certificate?.certificate_number?.split("HQ")[1] || "";
  const hasUnsavedChanges = isEditing;

  return (
    <div className="certificate-page">
      {/* Form Section */}
      <div className="certificate-form">
        <h2>
          {isSaved && !isEditing
            ? "View PFT Certificate"
            : isSaved && isEditing
              ? "Edit PFT Certificate"
              : "Issue PFT Certificate"}
        </h2>

        <p className="form-subtitle">
          {isSaved && !isEditing
            ? `Certificate ${certificate.certificate_number} has been issued`
            : isSaved && isEditing
              ? "Make corrections to the certificate fields below"
              : "Fill in the certificate details below"}
        </p>

        {/* Issuer Info Display */}
        {isSaved && certificate && (
          <div
            className="issuer-info-box"
            style={{
              background: "#f0f8ff",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "15px",
              fontSize: "0.85rem",
            }}
          >
            <p style={{ margin: "0 0 5px 0" }}>
              <strong>Originally issued by:</strong> {certificate.issuer_name} (
              {certificate.issuer_title})
            </p>
            {certificate.last_modified_by_name &&
              certificate.last_modified_by_name !== certificate.issuer_name && (
                <p style={{ margin: 0, color: "#666" }}>
                  <strong>Last modified by:</strong>{" "}
                  {certificate.last_modified_by_name}
                </p>
              )}
          </div>
        )}

        <div className="form-group">
          <label>Certificate Number</label>
          <input
            type="text"
            value={
              certificate?.certificate_number || "Will be generated on save"
            }
            readOnly
            className="readonly"
            style={{ backgroundColor: "#f0f0f0" }}
          />
        </div>

        <div className="form-group">
          <label>Title & Name *</label>
          <input
            type="text"
            value={formData.titleAndName}
            onChange={(e) =>
              isEditing && handleChange("titleAndName", e.target.value)
            }
            placeholder="e.g. Mr John Doe"
            readOnly={!isEditing}
            style={!isEditing ? { backgroundColor: "#f0f0f0" } : {}}
          />
        </div>

        <div className="form-group">
          <label>Participated In *</label>
          <input
            type="text"
            value={formData.participatedIn}
            onChange={(e) =>
              isEditing && handleChange("participatedIn", e.target.value)
            }
            placeholder="e.g. NAF Annual PFT 2026"
            readOnly={!isEditing}
            style={!isEditing ? { backgroundColor: "#f0f0f0" } : {}}
          />
        </div>

        <div className="form-group">
          <label>Confirmation Status *</label>
          <div className="checkbox-group">
            {["fit", "not fit", "excused"].map((statusValue) => (
              <label
                key={statusValue}
                className="checkbox-label"
                style={{
                  opacity: !isEditing ? 0.6 : 1,
                  cursor: isEditing ? "pointer" : "not-allowed",
                }}
              >
                <input
                  type="radio"
                  name="status"
                  checked={formData.status === statusValue}
                  onChange={() =>
                    isEditing && handleChange("status", statusValue)
                  }
                  disabled={!isEditing}
                />
                <span>{getStatusLabel(statusValue)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>At (Location) *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              isEditing && handleChange("location", e.target.value)
            }
            placeholder="e.g. NAF Base Abuja"
            readOnly={!isEditing}
            style={!isEditing ? { backgroundColor: "#f0f0f0" } : {}}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Day</label>
            <input
              type="text"
              value={formData.issuedDay}
              onChange={(e) =>
                isEditing && handleChange("issuedDay", e.target.value)
              }
              readOnly={!isEditing}
              style={!isEditing ? { backgroundColor: "#f0f0f0" } : {}}
            />
          </div>
          <div className="form-group">
            <label>Month</label>
            <input
              type="text"
              value={formData.issuedMonth}
              onChange={(e) =>
                isEditing && handleChange("issuedMonth", e.target.value)
              }
              readOnly={!isEditing}
              style={!isEditing ? { backgroundColor: "#f0f0f0" } : {}}
            />
          </div>
          <div className="form-group">
            <label>Year (20__)</label>
            <input
              type="text"
              value={formData.issuedYear}
              onChange={(e) =>
                isEditing && handleChange("issuedYear", e.target.value)
              }
              maxLength="2"
              readOnly={!isEditing}
              style={!isEditing ? { backgroundColor: "#f0f0f0" } : {}}
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleBack} className="btn back-btn">
            ← Back
          </button>

          {/* ✅ FIXED: Only show Edit button if user has edit permission */}
          {isSaved && !isEditing && canEditCertificate && (
            <button
              onClick={enableEditMode}
              className="btn edit-btn"
              style={{ background: "#f59e0b" }}
            >
              Edit Certificate
            </button>
          )}

          {isSaved && isEditing && (
            <button
              onClick={cancelEditMode}
              className="btn cancel-btn"
              style={{ background: "#6c757d" }}
              disabled={isSaving}
            >
              Cancel
            </button>
          )}

          {/* ✅ FIXED: Only show Save button if user has issue/edit permission */}
          {(isEditing || !isSaved) && canModifyCertificate && (
            <button
              onClick={handleSaveOrUpdate}
              className="btn save-btn"
              disabled={isSaving}
              style={{
                background: isSaved ? "#28a745" : "#0b3d91",
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving
                ? "Saving..."
                : isSaved
                  ? "Update Certificate"
                  : "Save Certificate"}
            </button>
          )}

          <button
            onClick={generatePDF}
            className="btn pdf-btn"
            disabled={isSaving || (isEditing && hasUnsavedChanges)}
            title={
              isEditing && hasUnsavedChanges
                ? "Save changes before downloading"
                : ""
            }
          >
            Download PDF
          </button>

          <button
            onClick={sendCertificate}
            className="btn email-btn"
            disabled={isSending || isSaving || (isEditing && hasUnsavedChanges)}
            title={
              isEditing && hasUnsavedChanges
                ? "Save changes before sending"
                : ""
            }
          >
            {isSending ? "Sending..." : "Send to Email"}
          </button>
        </div>

        {/* Status Messages */}
        {isSaved && !isEditing && (
          <p
            style={{
              marginTop: "10px",
              color: "#28a745",
              fontSize: "0.9rem",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            ✓ This certificate has been saved.
            {canEditCertificate &&
              ' Click "Edit Certificate" to make corrections.'}
            {!canEditCertificate && " Contact an admin to make corrections."}
          </p>
        )}

        {isEditing && (
          <p
            style={{
              marginTop: "10px",
              color: "#f59e0b",
              fontSize: "0.9rem",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            ⚠ You have unsaved changes. Click "
            {isSaved ? "Update Certificate" : "Save Certificate"}" to save.
          </p>
        )}
      </div>

      {/* Certificate Preview */}
      <div className="certificate-preview">
        <h3>Preview</h3>
        <div ref={certRef} className="certificate-wrapper">
          <div className="border-outer"></div>
          <div className="border-inner"></div>
          <div className="watermark-layer">
            {watermarkArray.map((_, index) => (
              <div key={index} className="watermark-text">
                NIGERIAN AIR FORCE
              </div>
            ))}
          </div>
          <div className="certificate-content">
            <div className="cert-number-section">
              <div className="cert-number-full">
                NAF/786/HQ
                {/* <span className="cert-num-value">{certNumber || "______"}</span> */}
              </div>
              {/* <div className="cert-number-note">
                (To identify the comds/053 NAF CAMP)
              </div> */}
              <div className="cert-number-full">{certNumber || "______"}</div>
            </div>
            <div className="cert-logo">
              <img src={airForceLogo} alt="Nigerian Air Force" />
            </div>
            <h1 className="cert-main-title">
              NAF PHYSICAL FITNESS TEST CERTIFICATE
            </h1>
            <p className="cert-presented-to">Presented to</p>
            <div className="cert-fields">
              <div className="cert-row three-cols">
                <div className="cert-field">
                  <span className="field-label">Title &amp; Name</span>
                  <span className="field-line">
                    {formData.titleAndName || "_______________________"}
                  </span>
                </div>
                <div className="cert-field">
                  <span className="field-label">Svc No.</span>
                  <span className="field-line">
                    {result.participant_id || "_______________________"}
                  </span>
                </div>
                <div className="cert-field">
                  <span className="field-label">Unit</span>
                  <span className="field-line">
                    {result.unit || "_______________________"}
                  </span>
                </div>
              </div>
              <div className="cert-row">
                <div className="cert-field full">
                  <span className="field-label">Participated in:</span>
                  <span className="field-line">
                    {formData.participatedIn || ""}
                  </span>
                </div>
              </div>
              <div className="cert-row confirmation-row">
                <span className="field-label">and Confirmed:</span>
                <div className="confirmation-boxes">
                  <div
                    className={`conf-box ${formData.status === "fit" ? "checked" : ""}`}
                  >
                    <span>Fit</span>
                    <div className="box"></div>
                  </div>
                  <div
                    className={`conf-box ${formData.status === "not fit" || formData.status === "not_fit" ? "checked" : ""}`}
                  >
                    <span>Not Fit</span>
                    <div className="box"></div>
                  </div>
                  <div
                    className={`conf-box ${formData.status === "excused" ? "checked" : ""}`}
                  >
                    <span>Excused</span>
                    <div className="box"></div>
                  </div>
                </div>
              </div>
              <div className="cert-row">
                <div className="cert-field full">
                  <span className="field-label">At</span>
                  <span className="field-line">{formData.location || ""}</span>
                </div>
              </div>
              <div className="cert-row issued-row">
                <span className="issued-text">
                  Issued on{" "}
                  <span className="issued-line">
                    {formData.issuedDay || "__________"}
                  </span>{" "}
                  day of{" "}
                  <span className="issued-line">
                    {formData.issuedMonth || "_____"}
                  </span>{" "}
                  <span className="issued-line">
                    20{formData.issuedYear || "____"}
                  </span>
                </span>
              </div>
            </div>
            <div className="cert-bottom">
              <div className="signature-block">
                <div className="signature-line">
                  <img src={aocSignatureImg} alt="AOC Signature" />
                </div>
                <div className="signature-label">
                  Chief of Administrstion (Sign)
                </div>
              </div>
              <div className="seal-block">
                <img src={seal} alt="Official Seal" />
              </div>
              <div className="signature-block">
                <div className="signature-line">
                  <img
                    src={sportsSignatureImg}
                    alt="Sports Officer Signature"
                  />
                </div>
                <div className="signature-label">Director of Sport (Sign)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

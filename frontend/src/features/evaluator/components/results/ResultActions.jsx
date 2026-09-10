import React from "react";
export default function ActionButtons({
  onDownload,
  onHome,
  sendMail,
  isSending,
}) {
  return (
    <div className="action-buttons">
      <button onClick={onDownload} className="btn pdf-btn" disabled={isSending}>
        Download as PDF
      </button>
      <button onClick={sendMail} className="btn email-btn" disabled={isSending}>
        {isSending ? "Sending..." : "Send to Email"}
      </button>
      <button onClick={onHome} className="btn home-btn" disabled={isSending}>
        Back to Homepage
      </button>
    </div>
  );
}

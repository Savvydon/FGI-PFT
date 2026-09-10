import React from "react";
import { API_BASE } from "../../../config/env.js";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Header from "../components/results/ResultsHeader.jsx";
import PersonalInfo from "../components/results/PersonalInfo.jsx";
import StatusGroups from "../components/results/StatusGroups.jsx";
import ActionButtons from "../components/results/ResultActions.jsx";
import OverallRecommendation from "../components/results/OverallRecommendation.jsx";

import "../../../styles/Results.css";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const resultsRef = useRef(null);
  const [resultData, setResultData] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const state = location.state;
    if (!state) {
      navigate("/", { replace: true });
      return;
    }
    setResultData(state);
  }, [location.state, navigate]);

  if (!resultData) return null;

  

  const generatePDF = async (forEmail = false) => {
    const input = resultsRef.current;
    if (!input) return null;

    // Save original styles
    const originalStyles = {
      position: input.style.position,
      top: input.style.top,
      left: input.style.left,
      width: input.style.width,
      maxWidth: input.style.maxWidth,
      minWidth: input.style.minWidth,
      margin: input.style.margin,
      transform: input.style.transform,
    };

    // FIXED: Always use desktop width for consistent PDF output
    const DESKTOP_WIDTH = 900; // Desktop viewport width

    input.style.position = "absolute";
    input.style.top = "0";
    input.style.left = "0";
    input.style.margin = "0";
    input.style.transform = "none";
    input.style.width = DESKTOP_WIDTH + "px";
    input.style.maxWidth = DESKTOP_WIDTH + "px";
    input.style.minWidth = DESKTOP_WIDTH + "px";

    input.classList.add("pdf-mode");

    // Wait for layout to settle
    await new Promise((r) => setTimeout(r, 600));

    try {
      const captureScale = forEmail ? 2 : 3;

      const canvas = await html2canvas(input, {
        scale: captureScale,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: DESKTOP_WIDTH,
        // CRITICAL FIX: Force desktop viewport so media queries don't trigger mobile styles
        windowWidth: DESKTOP_WIDTH,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const marginX = 5;
      const marginY = 2;
      const usableWidth = pageWidth - marginX * 2;
      const usableHeight = pageHeight - marginY * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdfImgWidth = usableWidth;
      const pdfImgHeight = (imgHeight * usableWidth) / imgWidth;

      if (pdfImgHeight <= usableHeight) {
        const imgData = canvas.toDataURL("image/jpeg", forEmail ? 0.85 : 0.95);
        pdf.addImage(
          imgData,
          "JPEG",
          marginX,
          marginY,
          pdfImgWidth,
          pdfImgHeight,
        );
      } else {
        let positionY = marginY;
        let sourceY = 0;
        const pageHeightPx = (usableHeight * imgWidth) / pdfImgWidth;

        while (sourceY < imgHeight) {
          if (sourceY > 0) {
            pdf.addPage();
            positionY = marginY;
          }

          const sliceHeight = Math.min(pageHeightPx, imgHeight - sourceY);
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = imgWidth;
          tempCanvas.height = sliceHeight;

          const ctx = tempCanvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            imgWidth,
            sliceHeight,
            0,
            0,
            imgWidth,
            sliceHeight,
          );

          const imgData = tempCanvas.toDataURL(
            "image/jpeg",
            forEmail ? 0.85 : 0.95,
          );
          const slicePdfHeight = (sliceHeight * pdfImgWidth) / imgWidth;

          pdf.addImage(
            imgData,
            "JPEG",
            marginX,
            positionY,
            pdfImgWidth,
            slicePdfHeight,
          );

          sourceY += sliceHeight;
        }
      }

      return pdf;
    } finally {
      Object.assign(input.style, originalStyles);
      input.classList.remove("pdf-mode");
    }
  };

  // ---------- DOWNLOAD PDF ----------
  const downloadPDF = async () => {
    try {
      const pdf = await generatePDF(false);
      if (!pdf) return;
      pdf.save(`NAF_PFT_${resultData.participant_id || "RESULT"}.pdf`);
    } catch (e) {
      console.error("PDF download error:", e);
      alert("Failed to generate PDF");
    }
  };

  // ---------- SEND EMAIL ----------
  const sendEmail = async () => {
    if (isSending) return;

    console.log("=== Send Email clicked ===");
    console.log("Sending to:", resultData.email);
    console.log("Personnel name:", resultData.full_name);

    if (!resultData.email) {
      alert("No email address provided. Please enter an email in the form.");
      return;
    }

    setIsSending(true);

    try {
      const pdf = await generatePDF(true);
      if (!pdf) throw new Error("Failed to generate PDF");

      const pdfBlob = pdf.output("blob");

      console.log("PDF Blob size:", pdfBlob.size, "bytes");

      if (pdfBlob.size > 4.5 * 1024 * 1024) {
        alert("PDF is too large for email. Please download and send manually.");
        setIsSending(false);
        return;
      }

      const formData = new FormData();
      formData.append("email", resultData.email);
      formData.append("file", pdfBlob, "NAF_PFT_Report.pdf");
      formData.append("personnel_name", resultData.full_name || "");

      const res = await fetch(
        "__API_BASE__/send-report-pdf",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errText = errData.detail || (await res.text());
        console.error("Server error:", res.status, errText);
        throw new Error(`Server error: ${res.status} - ${errText}`);
      }

      const data = await res.json();
      console.log("Email sent successfully:", data);
      alert("Report sent successfully to " + resultData.email);
    } catch (err) {
      console.error("Send email failed:", err);
      alert("Failed to send email: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const goToHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <>
      <div className="results" ref={resultsRef}>
        <Header />
        <PersonalInfo state={resultData} />
        <StatusGroups state={resultData} />
        <OverallRecommendation state={resultData} />
      </div>

      <ActionButtons
        onDownload={downloadPDF}
        onHome={goToHome}
        sendMail={sendEmail}
        isSending={isSending}
      />
    </>
  );
}

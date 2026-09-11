import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getParticipantRecord } from "../services/adminApi.js";
import Header from "../../evaluator/components/results/ResultsHeader.jsx";
import PersonalInfo from "../../evaluator/components/results/PersonalInfo.jsx";
import StatusGroups from "../../evaluator/components/results/StatusGroups.jsx";
import OverallRecommendation from "../../evaluator/components/results/OverallRecommendation.jsx";
import "../../../styles/Results.css";
import "../styles/Admin.css";

export default function PersonnelDetailsPage({ fromSuperAdmin = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [record, setRecord] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);
  const isSuperAdmin = fromSuperAdmin || location.pathname.includes("/superadmin/");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getParticipantRecord(id);
        setRecord(data);
        setSelectedId(data.evaluations?.[0]?.id || null);
      } catch (err) { setError(err.message || "Failed to load participant record"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const selected = record?.evaluations?.find((e) => e.id === selectedId) || record?.evaluations?.[0];
  const returnTo = location.state?.returnTo || (isSuperAdmin ? "/superadmin/pft-results" : "/admin/personnel");

  const downloadPDF = async () => {
    if (!resultsRef.current || !selected) return;
    const canvas = await html2canvas(resultsRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = 190;
    pdf.addImage(img, "PNG", 10, 10, width, (canvas.height * width) / canvas.width);
    pdf.save(`PFT_${record.participant.participant_id}_${selected.year}.pdf`);
  };

  if (loading) return <div className="loading-text">Loading participant record...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!record) return <div className="not-found">Participant not found.</div>;

  return (
    <div className="admin-container">
      <div className="participant-profile-card">
        <h2>{record.participant.full_name}</h2>
        <div className="participant-profile-grid">
          <p><b>Participant ID:</b> {record.participant.participant_id}</p>
          <p><b>Title:</b> {record.participant.title}</p>
          <p><b>Email:</b> {record.participant.email || "N/A"}</p>
          <p><b>Unit / Organization:</b> {record.participant.unit || "N/A"}</p>
          <p><b>Appointment / Occupation:</b> {record.participant.appointment || "N/A"}</p>
          <p><b>Total Evaluations:</b> {record.evaluations_count}</p>
        </div>
      </div>

      <div className="evaluation-history-card">
        <h3>Evaluation History</h3>
        <div className="table-scroll">
          <table className="personnel-table">
            <thead><tr><th>Year</th><th>Date</th><th>Score</th><th>Grade</th><th>Evaluator</th><th>Admin</th><th>Action</th></tr></thead>
            <tbody>{record.evaluations.map((e) => (
              <tr key={e.id} className={selected?.id === e.id ? "selected-row" : ""}>
                <td>{e.year}</td><td>{e.date || "N/A"}</td><td>{e.aggregate ?? "N/A"}</td><td>{e.grade || "N/A"}</td>
                <td>{e.evaluator_title || "N/A"}<br /><small>{e.evaluator_name || ""}</small></td>
                <td>{e.admin_name || "N/A"}</td>
                <td><button className="view-btn" onClick={() => setSelectedId(e.id)}>View Evaluation</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {selected && (
        <>
          <div ref={resultsRef} className="results">
            <Header />
            <PersonalInfo state={selected} />
            <StatusGroups state={selected} />
            <OverallRecommendation state={selected} />
          </div>
          <div className="admin-actions-container">
            <button className="back-btn" onClick={() => navigate(returnTo)}>Back to Participants</button>
            <button className="edit-btn" onClick={() => navigate(`${isSuperAdmin ? "/superadmin/pft-results" : "/admin/personnel"}/${selected.id}/edit`, { state: { returnTo } })}>Edit Evaluation</button>
            <button className="btn pdf-btn" onClick={downloadPDF}>Download PDF</button>
            <button className="btn issue-btn" onClick={() => navigate(`${isSuperAdmin ? "/superadmin/pft-results" : "/admin/personnel"}/${selected.id}/certificate`, { state: { returnTo } })}>Certificate</button>
          </div>
        </>
      )}
    </div>
  );
}

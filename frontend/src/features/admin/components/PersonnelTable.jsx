import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

export default function PersonnelTable({ data, onView }) {
  const navigate = useNavigate();
  return (
    <div className="personnel-table-container">
      <div className="table-scroll">
        <table className="personnel-table">
          <thead><tr><th>S/N</th><th>Name</th><th>Title</th><th>Participant ID</th><th>Latest Year</th><th>Latest Score</th><th>Grade</th><th>Evaluations</th><th>Actions</th></tr></thead>
          <tbody>
            {data.map((p, index) => (
              <tr key={p.id}>
                <td><strong>{index + 1}</strong></td>
                <td>{p.full_name}</td>
                <td>{p.title}</td>
                <td>{p.participant_id}</td>
                <td>{p.latest_year || "—"}</td>
                <td>{p.latest_score ?? "—"}</td>
                <td>{p.latest_grade || "—"}</td>
                <td style={{ textAlign: "center" }}>{p.evaluations_count}</td>
                <td className="actions-cell">
                  <button className="view-btn" onClick={() => onView ? onView(p.participant_id) : navigate(`/admin/personnel/${encodeURIComponent(p.participant_id)}`)}>View Full Record</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

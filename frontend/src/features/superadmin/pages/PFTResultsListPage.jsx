import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "../../../config/env.js";
import "../styles/superadmin.css";

export default function PFTResultsListPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  const pageSize = 25;

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`${API_BASE}/api/participants?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load participants");
      const data = await res.json();
      setItems(data.items || []); setMeta(data); setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search]);
  const changePage = (next) => setSearchParams({ page: String(next), ...(search ? { search } : {}) });

  return (
    <div className="superadmin-container">
      <h2>Participants</h2>
      <p>Each participant has one profile and a complete history of PFT evaluations.</p>
      <div className="search-container">
        <input className="search-input" value={search} onChange={(e) => { setSearch(e.target.value); setSearchParams({ page: "1", ...(e.target.value.trim() ? { search: e.target.value.trim() } : {}) }); }} placeholder="Search by name, Participant ID, or email..." />
      </div>
      <div className="list-meta">{loading ? "Loading participants..." : `${Number(meta.total || 0).toLocaleString()} participant${meta.total === 1 ? "" : "s"}`}</div>
      {error && <div className="error">{error}</div>}
      {loading ? <div className="loading">Loading participants...</div> : items.length === 0 ? <div className="empty-state"><p>No participants found.</p></div> : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>S/N</th><th>Name</th><th>Title</th><th>Participant ID</th><th>Latest Year</th><th>Score</th><th>Grade</th><th>Evaluations</th><th>Action</th></tr></thead>
              <tbody>{items.map((p, i) => (
                <tr key={p.id}>
                  <td>{(page - 1) * pageSize + i + 1}</td><td>{p.full_name}</td><td>{p.title}</td><td>{p.participant_id}</td>
                  <td>{p.latest_year || "—"}</td><td>{p.latest_score ?? "—"}</td><td>{p.latest_grade || "—"}</td>
                  <td style={{ textAlign: "center" }}>{p.evaluations_count}</td>
                  <td><button className="view-btn" onClick={() => navigate(`/superadmin/participants/${encodeURIComponent(p.participant_id)}`, { state: { returnTo: `/superadmin/pft-results?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}` } })}>View Full Record</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {meta.total_pages > 1 && <div className="pagination"><button className="page-btn" disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</button><span>Page {page.toLocaleString()} of {Number(meta.total_pages).toLocaleString()}</span><button className="page-btn" disabled={page >= meta.total_pages} onClick={() => changePage(page + 1)}>Next</button></div>}
        </>
      )}
      <button onClick={() => navigate("/superadmin/dashboard")} className="back-btn">Back to Dashboard</button>
    </div>
  );
}

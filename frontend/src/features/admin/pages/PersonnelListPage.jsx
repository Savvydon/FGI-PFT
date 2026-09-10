import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAdminData } from "../hooks/useAdminData.jsx";
import AdminHeader from "../components/AdminHeader.jsx";
import AdminSidebar from "../components/AdminSidebar.jsx";
import PersonnelTable from "../components/PersonnelTable.jsx";
import Pagination from "../components/Pagination.jsx";
import "../styles/Admin.css";

export default function PersonnelListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const pageSize = 25;
  const { personnel, total, totalPages, loading, error } = useAdminData({ page, pageSize, search });

  const changePage = (next) => setSearchParams({ page: String(next), ...(search ? { search } : {}) });
  const submitSearch = (value) => {
    setSearch(value);
    setSearchParams({ page: "1", ...(value.trim() ? { search: value.trim() } : {}) });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminHeader />
        <div className="list-header">
          <div>
            <h3>Participants</h3>
            <div className="list-meta">{loading ? "Loading participants..." : `${total.toLocaleString()} participant${total === 1 ? "" : "s"}`}</div>
          </div>
        </div>
        <div className="search-container">
          <input className="search-input" value={search} onChange={(e) => submitSearch(e.target.value)} placeholder="Search by name, Participant ID, or email..." />
        </div>
        {error && <div className="error">{error}</div>}
        {loading ? (
          <div className="loading-skeleton"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div>
        ) : personnel.length === 0 ? (
          <div className="empty-state"><p>No participant records found.</p></div>
        ) : (
          <>
            <PersonnelTable data={personnel} onView={(participantId) => navigate(`/admin/personnel/${encodeURIComponent(participantId)}`, { state: { returnTo: `/admin/personnel?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}` } })} />
            <Pagination page={page} setPage={changePage} totalPages={totalPages} />
          </>
        )}
      </div>
    </div>
  );
}

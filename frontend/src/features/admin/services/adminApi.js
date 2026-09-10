import { API_BASE } from "../../../config/env.js";

const getHeaders = (contentType = true) => contentType ? { "Content-Type": "application/json" } : {};

async function handleError(res) {
  let data = {};
  try { data = await res.json(); } catch {}
  throw new Error(data.detail || data.message || `Request failed (status ${res.status})`);
}

export async function loginAdmin(credentials) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST", headers: getHeaders(), credentials: "include", body: JSON.stringify(credentials),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Login failed (status ${response.status})`);
  if (!["admin", "super_admin"].includes(String(data.role || "").toLowerCase())) {
    throw new Error("This account cannot use the Admin login portal.");
  }
  return data;
}

export async function getParticipants({ page = 1, pageSize = 25, search = "" } = {}) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (search.trim()) params.set("search", search.trim());
  const response = await fetch(`${API_BASE}/api/participants?${params.toString()}`, {
    credentials: "include", headers: getHeaders(),
  });
  if (!response.ok) await handleError(response);
  return response.json();
}

export async function getParticipantRecord(participantId) {
  const response = await fetch(`${API_BASE}/api/participants/${encodeURIComponent(participantId)}`, {
    credentials: "include", headers: getHeaders(),
  });
  if (!response.ok) await handleError(response);
  return response.json();
}

export async function getAllPersonnel(options = {}) { return getParticipants(options); }

export async function getPersonnelById(id) {
  const response = await fetch(`${API_BASE}/api/pft-results/${id}`, { credentials: "include", headers: getHeaders() });
  if (!response.ok) await handleError(response);
  return response.json();
}

export async function searchPersonnel(query) {
  return getParticipants({ page: 1, pageSize: 25, search: query });
}

export async function deletePersonnel(id) {
  const response = await fetch(`${API_BASE}/api/pft-results/${id}`, { method: "DELETE", credentials: "include", headers: getHeaders() });
  if (!response.ok) await handleError(response);
  return response.json();
}

export async function updatePersonnel(id, updateData) {
  const response = await fetch(`${API_BASE}/api/pft-results/${id}`, {
    method: "PUT", headers: getHeaders(), credentials: "include", body: JSON.stringify(updateData),
  });
  if (!response.ok) await handleError(response);
  return response.json();
}

// Set VITE_API_BASE_URL to the URL of the new FastAPI backend.
// Local development defaults to the local FastAPI server.
const DEFAULT_API_BASE = "http://localhost:8000";

export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE
).replace(/\/$/, "");

import { useCallback, useEffect, useState } from "react";
import { getParticipants } from "../services/adminApi.js";

export function useAdminData({ page = 1, pageSize = 25, search = "" } = {}) {
  const [personnel, setPersonnel] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPersonnel = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getParticipants({ page, pageSize, search });
      setPersonnel(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 0);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load participants");
    } finally { setLoading(false); }
  }, [page, pageSize, search]);

  useEffect(() => { loadPersonnel(); }, [loadPersonnel]);

  return { personnel, total, totalPages, loading, error, refresh: loadPersonnel };
}

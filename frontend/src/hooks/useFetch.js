import { useState, useEffect, useCallback } from "react";
import { API_URL, authHeader } from "../context/AuthContext";
const token = localStorage.getItem('token');
export function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${path}`, { headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Request failed");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, ...deps]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeader(), ...options.headers },
    headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}
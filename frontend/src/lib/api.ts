const API_BASE = '/api';

function getOrigin() {
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}

export async function fetchAPI(endpoint: string, params?: Record<string, string>) {
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function getExportURL(params?: Record<string, string>) {
  let url = `${API_BASE}/stats/export`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

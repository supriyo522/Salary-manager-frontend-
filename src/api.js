const json = async (res) => {
  const body = res.status === 204 ? null : await res.json();
  if (!res.ok) throw Object.assign(new Error('Request failed'), { details: body });
  return body;
};
const send = (method, url, body) =>
  fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(json);

const API_BASE = import.meta.env.VITE_API_URL || 'https://salary-manager-backend-1.onrender.com';

export const api = {
  employees: (params) => fetch(`${API_BASE}/api/employees?${new URLSearchParams(params)}`).then(json),
  create: (e) => send('POST', `${API_BASE}/api/employees`, e),
  update: (id, e) => send('PUT', `${API_BASE}/api/employees/${id}`, e),
  remove: (id) => fetch(`${API_BASE}/api/employees/${id}`, { method: 'DELETE' }).then(json),
  insights: (params) => fetch(`${API_BASE}/api/insights?${new URLSearchParams(params)}`).then(json),
  meta: () => fetch(`${API_BASE}/api/insights/meta`).then(json),
};
export const fmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

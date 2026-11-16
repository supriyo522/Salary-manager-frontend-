const json = async (res) => {
  const body = res.status === 204 ? null : await res.json();
  if (!res.ok) throw Object.assign(new Error('Request failed'), { details: body });
  return body;
};
const send = (method, url, body) =>
  fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(json);

export const api = {
  employees: (params) => fetch('/api/employees?' + new URLSearchParams(params)).then(json),
  create: (e) => send('POST', '/api/employees', e),
  update: (id, e) => send('PUT', `/api/employees/${id}`, e),
  remove: (id) => fetch(`/api/employees/${id}`, { method: 'DELETE' }).then(json),
  insights: (params) => fetch('/api/insights?' + new URLSearchParams(params)).then(json),
  meta: () => fetch('/api/insights/meta').then(json),
};
export const fmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

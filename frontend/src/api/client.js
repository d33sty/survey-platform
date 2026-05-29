// В деве -> '/api'; под префиксом /survey/ -> '/survey/api'
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Ошибка запроса');
  }

  if (res.status === 204) return null;
  return res.json();
}

export const client = {
  get: (path, token) => request('GET', path, undefined, token),
  post: (path, body, token) => request('POST', path, body, token),
  patch: (path, body, token) => request('PATCH', path, body, token),
  delete: (path, token) => request('DELETE', path, undefined, token),
};

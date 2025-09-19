export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function getApiBase() {
  const base = import.meta.env.VITE_API_URL || '/api';
  return base.replace(/\/$/, '');
}

export async function apiFetch<T>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string, string>; auth?: boolean } = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = options;
  const token = auth ? localStorage.getItem('token') : null;
  const res = await fetch(`${getApiBase()}${path.startsWith('/') ? '' : '/'}${path}`.replace(/\/\/+/, '/'), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let errorMessage = text;
    try {
      const data = JSON.parse(text);
      errorMessage = data?.message || errorMessage;
    } catch {}
    throw new Error(errorMessage || `Request failed with status ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  // @ts-expect-error allow returning empty as any
  return undefined as T;
}

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function getApiBase() {
  const base = import.meta.env.VITE_API_URL;
  return String(base).replace(/\/$/, '');
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBase(),
  withCredentials: false,
});

axiosInstance.interceptors.request.use((config) => {
  const skipAuth = (config as any).skipAuth;
  if (!skipAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  if (config.data && !(config.headers as any)?.['Content-Type']) {
    config.headers = config.headers || {};
    (config.headers as any)['Content-Type'] = 'application/json';
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export async function apiFetch<T>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string, string>; auth?: boolean } = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = options;
  const cfg: AxiosRequestConfig = {
    url: path,
    method,
    data: body,
    headers,
  };
  if (!auth) {
    (cfg as any).skipAuth = true;
  }
  const res = await axiosInstance.request<T>(cfg);
  // axios interceptor returns full response; we want data
  return res.data as T;
}

export { axiosInstance };

const rawApiBase = import.meta.env.VITE_API_BASE;
const trimmedApiBase = typeof rawApiBase === 'string' ? rawApiBase.trim().replace(/\/+$|\s+$/g, '') : '';

export const API_BASE = trimmedApiBase;

export const api = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

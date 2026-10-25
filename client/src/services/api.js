const API_ROOT = import.meta.env.VITE_API_URL || '';

export const request = async (path, options = {}) => {
  const token = localStorage.getItem('simplequiz_token');
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || data?.error || 'Request failed');
    error.status = response.status;
    throw error;
  }
  return data;
};

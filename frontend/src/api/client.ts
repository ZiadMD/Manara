const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 6000
): Promise<T> {
  const token = localStorage.getItem('manara_token');
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = 'An error occurred';
      let data;
      try {
        data = await response.json();
        errorDetail = data.detail || data.message || errorDetail;
      } catch {
        errorDetail = response.statusText;
      }
      throw new ApiError(response.status, errorDetail, data);
    }

    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out. Please check your connection.');
    }
    throw err;
  }
}

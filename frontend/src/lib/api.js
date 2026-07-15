const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TIMEOUT_MS = 10000; // 10 seconds

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Request timed out. Please check if the server is running.')),
      ms
    );
    promise
      .then((val) => { clearTimeout(timer); resolve(val); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}

async function request(method, endpoint, data) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  try {
    const response = await withTimeout(
      fetch(`${API_URL}${endpoint}`, options),
      TIMEOUT_MS
    );
    // Try to parse JSON regardless of status for error messages
    let result;
    try {
      result = await response.json();
    } catch {
      if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
      return null;
    }
    if (!response.ok) {
      throw new Error(result?.error || result?.message || `API Error (${response.status})`);
    }
    return result;
  } catch (error) {
    // Distinguish network errors from application errors
    if (
      error instanceof TypeError ||
      error.message === 'Failed to fetch' ||
      error.message.includes('NetworkError') ||
      error.message.includes('ECONNREFUSED')
    ) {
      throw new Error(
        '⚠️ Cannot connect to the server. Please make sure the backend is running on port 5000.'
      );
    }
    throw error;
  }
}

export const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, data) => request('POST', endpoint, data),
  put: (endpoint, data) => request('PUT', endpoint, data),
  delete: (endpoint) => request('DELETE', endpoint),
};

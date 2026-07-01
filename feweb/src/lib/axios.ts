import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Axios instance chính — tự gắn Bearer token và tự refresh khi 401.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Đang refresh token hay không (chặn gọi trùng) */
let isRefreshing = false;

/** Hàng đợi các request bị hold lại khi đang refresh */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** Xử lý hàng đợi sau khi refresh xong */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

// ─── Request Interceptor ───
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (Auto Refresh) ───
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý 401 và request chưa retry
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Nếu request refresh chính nó bị 401 → logout
    if (originalRequest.url?.includes('/users/refresh')) {
      localStorage.removeItem('accessToken');

      localStorage.removeItem('refreshToken');

      localStorage.removeItem('user');

      window.location.href = '/login';

      return Promise.reject(error);
    }

    // Nếu đang refresh → đưa vào hàng đợi
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            resolve(api(originalRequest));
          },
          reject
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      localStorage.removeItem('accessToken');

      localStorage.removeItem('user');

      window.location.href = '/login';

      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/users/refresh`, { refreshToken });
      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      localStorage.setItem('accessToken', newAccessToken);

      localStorage.setItem('refreshToken', newRefreshToken);

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      localStorage.removeItem('accessToken');

      localStorage.removeItem('refreshToken');


      localStorage.removeItem('user');

      window.location.href = '/login';

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

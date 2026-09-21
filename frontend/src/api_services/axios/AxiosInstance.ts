import axios from 'axios';
import { showApiError } from '../../components/shared/ApiErrorToast';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const rawUser = localStorage.getItem('user');

  if (rawUser) {
    const user = JSON.parse(rawUser);

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      showApiError(getApiErrorMessage(
        error,
        'The request could not be completed. Please try again.'
      ));
    }

    return Promise.reject(error);
  }
);

export default api;

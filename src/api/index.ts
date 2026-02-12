import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'https://simply-compta.com/api/';
const TIMEOUT = 30000; // 30 seconds
const TOKEN_KEY = '@auth_token';


const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Retrieve token from AsyncStorage
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      
      if (token && config.headers) {
        // Add Authorization header with Bearer token
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error reading token from storage:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          console.log('Unauthorized access - clearing auth data');
          await AsyncStorage.removeItem(TOKEN_KEY);
          // You can dispatch a logout action here if needed
          break;
        
        case 403:
          // Forbidden - User doesn't have permission
          console.log('Access forbidden');
          break;
        
        case 404:
          // Not found
          console.log('Resource not found');
          break;
        
        case 500:
        case 502:
        case 503:
          // Server errors
          console.log('Server error occurred');
          break;
        
        default:
          console.log('API Error:', error.message);
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.log('Network error - no response received');
    } else {
      // Something happened in setting up the request
      console.log('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);


export default api;
export { TOKEN_KEY, BASE_URL };
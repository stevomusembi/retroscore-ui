// services/retroScoreApi.js
import axios from 'axios';

// For Android emulator, use 10.0.2.2
// For iOS simulator, use localhost
// For physical device, use your computer's IP address
const getBaseUrl = () => {
  // You'll need to replace this with your computer's IP address when testing on physical device
  // To find your IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
//   return 'http://10.0.2.2:8080/api'; // Android emulator
  // return 'http://localhost:8080/api'; // iOS simulator
  return 'http://192.168.1.251:8080/api'; // Physical device (replace XXX with your IP)

};

const API_BASE_URL = getBaseUrl();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging (optional)
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const retroScoreApi = {
  // Get random match
  getRandomMatch: async (userId: any = 1 ) => {
    try {
      const response = await apiClient.get(`/game/random-match?userId=${userId}`);
      return response.data;
    } catch (error:any) {
      throw new Error(`Failed to fetch random match: ${error.message}`);
    }
  },

  // Submit guess (you'll need this later)
  submitGuess: async (userId:any, gameData: any) => {
    try {
      const response = await apiClient.post(`/game/guess?userId=${userId}`, gameData);
      return response.data;
    } catch (error:any) {
      throw new Error(`Failed to submit guess: ${error.message}`);
    }
  },
};

export default retroScoreApi;
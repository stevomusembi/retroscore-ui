import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2
// For iOS simulator, use localhost
// For physical device, use your computer's IP address
const getBaseUrl = () => {
  // You'll need to replace this with your computer's IP address when testing on physical device
  // To find your IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
//   return 'http://10.0.2.2:8080/api'; // Android emulator
  // return 'http://localhost:8080/api'; // iOS simulator
 // return 'http://192.168.1.251:8080/api'; // Physical device (replace XXX with your IP)
   return '/api'; // web build docker nginx
};


// Function to get token based on platform
const getToken = async () => {
  try {
    if (Platform.OS !== 'web') {
      // Mobile platforms
      return await SecureStore.getItemAsync('auth_token');
    } else {
      // Web platform
      return sessionStorage.getItem('token');
    }
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
};

const API_BASE_URL = getBaseUrl();

// Create axios instance without initial headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  },
});

// Request interceptor to add token dynamically
apiClient.interceptors.request.use(
  async (config) => {
    // Get token dynamically for each request
    const token = await getToken();
    
    // Only add Authorization header if token exists (authenticated user)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If no token, request will be sent without Authorization header (guest user)
    
    // console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);


//  response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const retroScoreApi = {
  // Get random match
  getRandomMatch: async () => {
    try {
      const response = await apiClient.get(`/game/random-match`);
      return response.data;
    } catch (error:any) {
      throw new Error(`Failed to fetch random match: ${error.message}`);
    }
  },

  submitGuess: async ( gameData: any) => {
    try {
      const response = await apiClient.post(`/game/guess`, gameData);
      return response.data;
    } catch (error:any) {
      throw new Error(`Failed to submit guess: ${error.message}`);
    }
  },

   getUserSettings: async () => {
    try {
      const response = await apiClient.get(`/settings`);
      return response.data;
    } catch (error:any) {
      throw new Error(`Failed to get settings: ${error.message}`);
    }
  },
  updateUserSettings:async (settings:any)=>{
    try{
      const response = await apiClient.post(`settings`, settings);
      return response.data;
    }catch(error:any){
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  },
    updatLeaguePreferrence:async (leagueId:string)=>{
    try{
      const response = await apiClient.patch(`settings/preferredLeague?leagueId=${leagueId}`);
      return response.data;
        
    } catch(err:any){
      throw new Error(`Failed to update preferd league, :${err.message}`);
    }
  },
  updateGameDifficulty:async ( difficulty:string)=>{
    try{
      const response = await apiClient.patch(`settings/difficulty?difficulty=${difficulty}`);
      return response.data;
        
    } catch(err:any){
      throw new Error(`Failed to update game difficulty, :${err.message}`);
    }
  },
  updateGameTimeLimit:async ( limit:string)=>{
    try{
      const response = await apiClient.patch(`settings/timeLimit?timeLimit=${limit}`);
      return response.data;
        
    } catch(err:any){
      throw new Error(`Failed to update game time limit, :${err.message}`);
    }
  },
   updateNotification:async (enabled:boolean)=>{
    try{
      const response = await apiClient.patch(`settings/notifications?enabled=${enabled}`);
      return response.data;
        
    } catch(err:any){
      throw new Error(`Failed to update game notifications, :${err.message}`);
    }
  },
  updateHint:async (enabled:boolean)=>{
    try{
      const response = await apiClient.patch(`settings/hint?enabled=${enabled}`);
      return response.data;
        
    } catch(err:any){
      throw new Error(`Failed to update game , :${err.message}`);
    }
  },
    getLeaderBoard: async (page:number = 0,size:number =20) => {
    try {
      const response = await apiClient.get(`/leaderboard/public?page=${page}&size=${size}`);
      return response.data;
    } catch (error:any) {
      throw new Error(`Failed to get leader board: ${error.message}`);
    }
  },
  getUserStats: async () => {
    try {
      const response = await apiClient.get(`leaderboard/personal`);
      return response.data;
    } catch (error:any) {
      throw new Error(`Failed to get user rank: ${error.message}`);
    }
  },

};

export default retroScoreApi;
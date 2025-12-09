// API Configuration
// In development, use your local machine's IP address
// In production, use your actual API server URL
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3001' // Change to your machine's IP for testing on device (e.g., 'http://192.168.1.100:3001')
  : 'https://your-production-api.com';

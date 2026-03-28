/**
 * Centralized API configuration for the Trading Terminal.
 * This file handles logic for determining the API base URL based on
 * environment variables (Vite-style) and provides defaults.
 */

// For Vite, environment variables are accessed via import.meta.env
// VITE_API_URL should be the full URL, e.g., http://localhost:5000/api
// If running in development with the Vite proxy, /api will suffice.
const VITE_API_URL = import.meta.env.VITE_API_URL;

// Default to /api to utilize the Vite proxy in development,
// which will forward to http://localhost:5000/api
export const API_BASE_URL = VITE_API_URL || '/api';

/**
 * Common headers for API requests.
 */
export const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export default API_BASE_URL;

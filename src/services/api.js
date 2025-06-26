// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ecosrev-api.duckdns.org/api',
  timeout: 10000,
});

export default api;
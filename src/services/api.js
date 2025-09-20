// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 10000,
});

export default api;
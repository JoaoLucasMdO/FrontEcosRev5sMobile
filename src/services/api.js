// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backecosrev5s.onrender.com/api',
  timeout: 10000,
});

export default api;
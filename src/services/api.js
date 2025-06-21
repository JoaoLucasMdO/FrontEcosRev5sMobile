// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://18.215.24.30/api', 
  timeout: 10000,
});

export default api;
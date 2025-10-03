// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://length-households-adaptive-silence.trycloudflare.com/api',
  timeout: 10000,
});

export default api;
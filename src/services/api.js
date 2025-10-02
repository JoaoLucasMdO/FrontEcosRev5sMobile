// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://time-pointer-game-rebel.trycloudflare.com/api',
  timeout: 10000,
});

export default api;
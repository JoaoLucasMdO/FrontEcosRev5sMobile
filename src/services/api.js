// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://brilliant-geographic-involvement-expand.trycloudflare.com/api',
  timeout: 10000,
});

export default api;
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://established-owns-strengthen-survey.trycloudflare.com/api',
  timeout: 10000,
});

export default api;
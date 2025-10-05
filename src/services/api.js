// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pounds-msgid-jazz-inbox.trycloudflare.com/api',
  timeout: 10000,
});

export default api;
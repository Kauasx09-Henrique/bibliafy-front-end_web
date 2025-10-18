// Em: src/services/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bibliafy-api.onrender.com',
});

api.interceptors.request.use(async config => {
  // ✅ CORREÇÃO: Altere a chave para 'token' para corresponder ao seu AuthContext
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
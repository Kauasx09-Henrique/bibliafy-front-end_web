import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bibliafy-api.onrender.com', // A URL base do seu backend
});

export default api;
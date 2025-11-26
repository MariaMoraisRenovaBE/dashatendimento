import axios from 'axios';

// Cliente da API usando a base URL do .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export async function getProtocolos() {
  const response = await api.get('/api/dashboard/protocolos');
  return response.data;
}

export async function getProtocolosPorDia() {
  const response = await api.get('/api/dashboard/protocolos-por-dia');
  return response.data;
}

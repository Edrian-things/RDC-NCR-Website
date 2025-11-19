import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});

export async function fetchProjects() {
  const response = await api.get('projects/');
  return response.data;
}

export default api;

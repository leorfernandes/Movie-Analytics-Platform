import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const movieAPI = {
  // Business Intelligence endpoints
  getAnalytics: () => apiClient.get('/analytics/'),
  getProfitableMovies: () => apiClient.get('/movies/profitable/'),
  getMLTrainingData: () => apiClient.get('/ml-training-data/'),
  
  // Movie CRUD endpoints
  getMovies: (params = {}) => apiClient.get('/movies/', { params }),
  getMovie: (id) => apiClient.get(`/movies/${id}/`),
  
  // Reference data
  getStudios: () => apiClient.get('/studios/'),
  getGenres: () => apiClient.get('/genres/'),
  
  // Advanced filtering
  getMoviesByBudgetRange: (params) => apiClient.get('/movies/budget-range/', { params }),
};

export default movieAPI;
import { mockApi } from './mockApi';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true' || process.env.NODE_ENV === 'test';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}), ...(options.headers || {}) },
    ...options,
  });
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();
  if (!response.ok) throw new Error((isJson && (payload.message || payload.error)) || payload || 'Ismeretlen hiba');
  return payload;
}
async function withFallback(realRequest, fallbackRequest) { if (!USE_MOCK_API) return realRequest(); try { return await realRequest(); } catch { return fallbackRequest(); } }
export const api = {
  login: (email, password) => withFallback(() => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }), () => mockApi.login(email, password)),
  register: (body) => withFallback(() => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }), () => mockApi.register(body)),
  getCurrentUser: (token) => withFallback(() => request('/api/users/me', { token }), () => mockApi.getCurrentUser(token)),
  getProfile: (id, token) => withFallback(() => request(`/api/users/${id}`, { token }), () => mockApi.getProfile(id, token)),
  updateProfile: (id, body, token) => withFallback(() => request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(body), token }), () => mockApi.updateProfile(id, body, token)),
  getTodayMealPlan: (id, token) => withFallback(() => request(`/api/meal-plans/users/${id}/today`, { token }), () => mockApi.getTodayMealPlan(id, token)),
  getWeeklyMealPlan: async (id, token) => {
    try {
      return await request(`/api/meal-plans/users/${id}/weekly`, { token });
    } catch {
      return mockApi.getWeeklyMealPlan(id, token);
    }
  },
  generateMealPlan: (id, token) => withFallback(() => request(`/api/meal-plans/users/${id}/generate`, { method: 'POST', token }), () => mockApi.generateMealPlan(id, token)),
  listUsers: (token) => withFallback(() => request('/api/admin/users', { token }), () => mockApi.listUsers(token)),
  updateUserByAdmin: (id, body, token) => withFallback(() => request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body), token }), () => mockApi.updateUserByAdmin(id, body, token)),
  deleteUserByAdmin: (id, token) => withFallback(() => request(`/api/admin/users/${id}`, { method: 'DELETE', token }), () => mockApi.deleteUserByAdmin(id, token)),
  listFoods: (token) => withFallback(() => request('/api/admin/foods', { token }), () => mockApi.listFoods(token)),
  createFood: (body, token) => withFallback(() => request('/api/admin/foods', { method: 'POST', body: JSON.stringify(body), token }), () => mockApi.createFood(body, token)),
  updateFood: (id, body, token) => withFallback(() => request(`/api/admin/foods/${id}`, { method: 'PUT', body: JSON.stringify(body), token }), () => mockApi.updateFood(id, body, token)),
  deleteFood: (id, token) => withFallback(() => request(`/api/admin/foods/${id}`, { method: 'DELETE', token }), () => mockApi.deleteFood(id, token)),
  listRecipes: (token) => withFallback(() => request('/api/admin/recipes', { token }), () => mockApi.listRecipes(token)),
  createRecipe: (body, token) => withFallback(() => request('/api/admin/recipes', { method: 'POST', body: JSON.stringify(body), token }), () => mockApi.createRecipe(body, token)),
  updateRecipe: (id, body, token) => withFallback(() => request(`/api/admin/recipes/${id}`, { method: 'PUT', body: JSON.stringify(body), token }), () => mockApi.updateRecipe(id, body, token)),
  deleteRecipe: (id, token) => withFallback(() => request(`/api/admin/recipes/${id}`, { method: 'DELETE', token }), () => mockApi.deleteRecipe(id, token)),
};
export { API_BASE_URL, USE_MOCK_API };

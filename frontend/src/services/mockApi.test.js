import { mockApi } from './mockApi';

describe('mockApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('login returns token and current user can be resolved from it', async () => {
    const login = await mockApi.login('user@nutrismart.hu', 'user12345');

    expect(login.token).toBe('mock-token-2');
    expect(login.user.email).toBe('user@nutrismart.hu');
    await expect(mockApi.getCurrentUser(login.token)).resolves.toMatchObject({ id: 2, role: 'USER' });
  });

  test('login rejects wrong credentials and inactive users', async () => {
    await expect(mockApi.login('user@nutrismart.hu', 'wrongpass')).rejects.toThrow(/hibás/i);

    const admin = await mockApi.login('admin@nutrismart.hu', 'admin12345');
    await mockApi.updateUserByAdmin(2, { role: 'USER', active: false }, admin.token);
    await expect(mockApi.login('user@nutrismart.hu', 'user12345')).rejects.toThrow(/inaktív/i);
  });

  test('register creates user profile and prevents duplicate email', async () => {
    const response = await mockApi.register({
      fullName: 'Új User',
      email: 'uj@nutrismart.hu',
      password: 'StrongPass1',
    });

    expect(response.user).toMatchObject({ email: 'uj@nutrismart.hu', fullName: 'Új User', role: 'USER', active: true });
    await expect(mockApi.register({ fullName: 'Másik', email: 'uj@nutrismart.hu', password: 'StrongPass1' })).rejects.toThrow(/regisztrálva/i);
    await expect(mockApi.getProfile(response.user.id, response.token)).resolves.toMatchObject({ fullName: 'Új User' });
  });

  test('generateMealPlan returns three meals and weekly plan returns seven days', async () => {
    const login = await mockApi.login('user@nutrismart.hu', 'user12345');

    const today = await mockApi.generateMealPlan(login.user.id, login.token);
    const weekly = await mockApi.getWeeklyMealPlan(login.user.id, login.token);

    expect(today.meals).toHaveLength(3);
    expect(today.totalCalories).toBeGreaterThan(0);
    expect(weekly.days).toHaveLength(7);
    expect(weekly.days[0].meals).toHaveLength(3);
  });

  test('admin food and recipe mutations are persisted', async () => {
    const admin = await mockApi.login('admin@nutrismart.hu', 'admin12345');
    const food = await mockApi.createFood({
      name: 'Teszt tofu',
      category: 'protein',
      recommendedMeals: ['ebéd'],
      macroRole: 'protein',
      caloriesPer100g: 120,
      proteinPer100g: 15,
      carbsPer100g: 2,
      fatPer100g: 6,
      vegetarian: true,
      active: true,
    }, admin.token);

    await mockApi.updateFood(food.id, { ...food, name: 'Frissített tofu' }, admin.token);
    const foods = await mockApi.listFoods(admin.token);

    expect(foods.find((entry) => entry.id === food.id).name).toBe('Frissített tofu');
  });
});

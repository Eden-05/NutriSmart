import {
  calculateBmi,
  calculateBmr,
  calculateNutritionTargets,
  distributeCalories,
  formatNumber,
  getMealVisual,
  mealTypeLabel,
} from './nutrition';

describe('nutrition helpers', () => {
  test('calculates female BMR, BMI and goal-adjusted targets', () => {
    const profile = {
      gender: 'no',
      currentWeightKg: 70,
      heightCm: 170,
      age: 30,
      activityLevel: 'kozepes',
      goal: 'fogyas',
    };

    expect(calculateBmr('no', 70, 170, 30)).toBe(1452);
    expect(calculateBmi(70, 170)).toBe(24.2);
    expect(calculateNutritionTargets(profile)).toEqual({
      calories: 1801,
      protein: 133,
      carbs: 175,
      fat: 49,
      bmi: 24.2,
      bmr: 1452,
      tdee: 2251,
    });
  });

  test('falls back safely for missing profile and unknown meal type', () => {
    expect(calculateNutritionTargets(null)).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0, bmi: null, bmr: 0, tdee: 0 });
    expect(calculateBmr('ferfi', 0, 180, 30)).toBe(0);
    expect(mealTypeLabel('snack')).toBe('snack');
    expect(getMealVisual('snack').title).toBe('Tápláló reggeli');
  });

  test('distributes calories without losing the rounding remainder and formats Hungarian numbers', () => {
    expect(distributeCalories(2001)).toEqual({ reggeli: 600, ebéd: 800, vacsora: 601 });
    expect(formatNumber(1234.5)).toBe('1 234,5');
    expect(formatNumber('not-a-number')).toBe('not-a-number');
  });
});

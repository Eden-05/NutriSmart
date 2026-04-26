import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';

const profile = {
  fullName: 'Demo User',
  gender: 'no',
  age: 29,
  heightCm: 175,
  weightKg: 74,
  startingWeightKg: 78,
  currentWeightKg: 74,
  targetWeightKg: 68,
  waterGoalMl: 2500,
  mealsPerDay: 3,
  sleepGoalHours: 8,
  goal: 'fogyas',
  activityLevel: 'kozepes',
};

const mealPlan = {
  meals: [
    {
      mealType: 'reggeli',
      mealLabel: 'Reggeli',
      recipeName: 'Skyr zabkása',
      targetCalories: 500,
      totalCalories: 510,
      totalProteinG: 35,
      totalCarbsG: 55,
      totalFatG: 12,
      items: [{ foodName: 'Zabpehely', quantityG: 80, calories: 310, proteinG: 12, carbsG: 45, fatG: 6 }],
    },
  ],
};

describe('Dashboard', () => {
  test('shows user summary, macros and meal plan cards', () => {
    render(<Dashboard user={{ fullName: 'Demo User' }} profile={profile} mealPlan={mealPlan} onGenerateMealPlan={jest.fn()} onExportWeekly={jest.fn()} />);

    expect(screen.getByText(/demo user/i)).toBeInTheDocument();
    expect(screen.getByText(/napi kal/i)).toBeInTheDocument();
    expect(screen.getByText(/skyr zabkása/i)).toBeInTheDocument();
    expect(screen.getByText(/zabpehely/i)).toBeInTheDocument();
  });

  test('calls generate and weekly export actions', async () => {
    const onGenerateMealPlan = jest.fn();
    const onExportWeekly = jest.fn();
    render(<Dashboard user={{ email: 'user@nutrismart.hu' }} profile={profile} mealPlan={mealPlan} onGenerateMealPlan={onGenerateMealPlan} onExportWeekly={onExportWeekly} />);

    await userEvent.click(screen.getByRole('button', { name: /mai men/i }));
    await userEvent.click(screen.getByRole('button', { name: /heti menü letöltése/i }));

    expect(onGenerateMealPlan).toHaveBeenCalledTimes(1);
    expect(onExportWeekly).toHaveBeenCalledTimes(1);
  });

  test('renders empty meal plan state safely', () => {
    render(<Dashboard user={{ email: 'user@nutrismart.hu' }} profile={profile} mealPlan={null} onGenerateMealPlan={jest.fn()} onExportWeekly={jest.fn()} />);

    expect(screen.getByText(/m.g nincs gener.lt napi men./i)).toBeInTheDocument();
  });
});

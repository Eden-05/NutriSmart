import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileForm from './ProfileForm';

const profile = {
  id: 2,
  email: 'user@nutrismart.hu',
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
  vegetarianEnabled: false,
};

describe('ProfileForm', () => {
  test('renders profile values and converts numeric values before save', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<ProfileForm profile={profile} onSave={onSave} busy={false} />);

    await userEvent.clear(screen.getByLabelText(/aktuális súly/i));
    await userEvent.type(screen.getByLabelText(/aktuális súly/i), '72.5');
    await userEvent.clear(screen.getByLabelText(/napi vízcél/i));
    await userEvent.type(screen.getByLabelText(/napi vízcél/i), '3000');
    await userEvent.click(screen.getByRole('button', { name: /profil mentése/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      fullName: 'Demo User',
      age: 29,
      heightCm: 175,
      weightKg: 72.5,
      currentWeightKg: 72.5,
      waterGoalMl: 3000,
      mealsPerDay: 3,
      sleepGoalHours: 8,
    }));
  });

  test('saves vegetarian preference when switch is toggled', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<ProfileForm profile={profile} onSave={onSave} busy={false} />);

    await userEvent.click(screen.getByRole('checkbox', { name: /vegetáriánus/i }));
    await userEvent.click(screen.getByRole('button', { name: /profil mentése/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ vegetarianEnabled: true }));
  });

  test('disables submit button while busy', () => {
    render(<ProfileForm profile={profile} onSave={jest.fn()} busy />);

    expect(screen.getByRole('button', { name: /mentés/i })).toBeDisabled();
  });
});

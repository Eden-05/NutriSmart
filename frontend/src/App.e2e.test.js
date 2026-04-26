process.env.REACT_APP_USE_MOCK_API = 'true';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => { localStorage.clear(); });

test('frontend E2E: user can enable vegetarian option and see recipe-based meal plan', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText(/e-mail/i), 'user@nutrismart.hu');
  await userEvent.type(screen.getByLabelText(/jelszó/i), 'user12345');
  await userEvent.click(screen.getByRole('button', { name: /bejelentkez/i }));
  expect(await screen.findByText(/mai étrend/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /profil/i }));
  await userEvent.click(screen.getByRole('button', { name: /kikapcsolva/i }));
  await userEvent.click(screen.getByRole('button', { name: /profil mentése/i }));
  await userEvent.click(screen.getByRole('button', { name: /áttekintés/i }));
  expect(await screen.findByText(/recept/i)).toBeInTheDocument();
  expect(screen.getAllByText(/g$/i).length).toBeGreaterThan(0);
});

test('frontend E2E: admin can open admin tab and add a food', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText(/e-mail/i), 'admin@nutrismart.hu');
  await userEvent.type(screen.getByLabelText(/jelszó/i), 'admin12345');
  await userEvent.click(screen.getByRole('button', { name: /bejelentkez/i }));
  await userEvent.click(await screen.findByRole('button', { name: /admin/i }));
  await userEvent.clear(screen.getByLabelText('name'));
  await userEvent.type(screen.getByLabelText('name'), 'Teszt étel');
  await userEvent.click(screen.getByRole('button', { name: /étel hozzáadása/i }));
  await waitFor(() => expect(screen.getByText('Teszt étel')).toBeInTheDocument());
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPanel from './AuthPanel';

const setup = (props = {}) => render(<AuthPanel onLogin={jest.fn()} onRegister={jest.fn()} busy={false} {...props} />);

describe('AuthPanel', () => {
  test('submits login form and clears fields after successful login', async () => {
    const onLogin = jest.fn().mockResolvedValue(undefined);
    setup({ onLogin });

    await userEvent.type(screen.getByLabelText(/email cím/i), 'user@nutrismart.hu');
    await userEvent.type(screen.getByLabelText(/^jelszó$/i), 'user12345');
    await userEvent.click(screen.getByRole('button', { name: /^belépés$/i }));

    expect(onLogin).toHaveBeenCalledWith({ email: 'user@nutrismart.hu', password: 'user12345' });
    expect(screen.getByLabelText(/email cím/i)).toHaveValue('');
  });

  test('validates register form before calling api', async () => {
    const onRegister = jest.fn();
    setup({ onRegister });
    await userEvent.click(screen.getByRole('tab', { name: /regisztráció/i }));

    await userEvent.type(screen.getByLabelText(/teljes név/i), 'Teszt Elek');
    await userEvent.type(screen.getByLabelText(/email cím/i), '1teszt@nutrismart.hu');
    await userEvent.type(screen.getByLabelText(/^jelszó$/i), 'StrongPass1');
    await userEvent.type(screen.getByLabelText(/jelszó újra/i), 'Different1');
    await userEvent.click(screen.getByRole('button', { name: /fiók létrehozása/i }));

    expect(await screen.findByText(/email cím nem kezdődhet számmal/i)).toBeInTheDocument();
    expect(onRegister).not.toHaveBeenCalled();
  });

  test('submits trimmed register payload when validation passes', async () => {
    const onRegister = jest.fn().mockResolvedValue(undefined);
    setup({ onRegister });
    await userEvent.click(screen.getByRole('tab', { name: /regisztráció/i }));

    await userEvent.type(screen.getByLabelText(/teljes név/i), '  Teszt Elek  ');
    await userEvent.type(screen.getByLabelText(/email cím/i), '  teszt@nutrismart.hu  ');
    await userEvent.type(screen.getByLabelText(/^jelszó$/i), 'StrongPass1');
    await userEvent.type(screen.getByLabelText(/jelszó újra/i), 'StrongPass1');
    await userEvent.click(screen.getByRole('button', { name: /fiók létrehozása/i }));

    expect(onRegister).toHaveBeenCalledWith(expect.objectContaining({
      fullName: 'Teszt Elek',
      email: 'teszt@nutrismart.hu',
      password: 'StrongPass1',
      confirmPassword: 'StrongPass1',
    }));
  });

  test('can toggle password visibility', async () => {
    setup();
    const password = screen.getByLabelText(/^jelszó$/i);
    expect(password).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByLabelText(/jelszó megjelenítése/i));
    expect(password).toHaveAttribute('type', 'text');
  });
});

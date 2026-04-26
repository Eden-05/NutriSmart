import { clearSession, readSession, saveSession } from './storage';

describe('session storage helpers', () => {
  beforeEach(() => localStorage.clear());

  test('saves, reads and clears the authenticated session', () => {
    saveSession('token-123', { id: 1, email: 'user@nutrismart.hu' });

    expect(readSession()).toEqual({ token: 'token-123', user: { id: 1, email: 'user@nutrismart.hu' } });

    clearSession();
    expect(readSession()).toEqual({ token: null, user: null });
  });

  test('clears corrupted user JSON instead of crashing', () => {
    localStorage.setItem('nutrismart_token', 'token-123');
    localStorage.setItem('nutrismart_user', '{bad-json');

    expect(readSession()).toEqual({ token: null, user: null });
    expect(localStorage.getItem('nutrismart_token')).toBeNull();
  });
});

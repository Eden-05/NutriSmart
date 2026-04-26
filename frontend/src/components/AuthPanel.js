import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

const defaultLogin = { email: '', password: '' };
const defaultRegister = { fullName: '', email: '', password: '', confirmPassword: '' };
const MAX_FULL_NAME_LENGTH = 35;
const EMAIL_FIRST_CHAR_REGEX = /^[^0-9]/;

function PasswordField({ label, value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      fullWidth
      label={label}
      type={visible ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setVisible((prev) => !prev)} edge="end" aria-label={visible ? `${label} elrejtése` : `${label} megjelenítése`}>
              {visible ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

function AuthPanel({ onLogin, onRegister, busy }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(defaultLogin);
  const [registerForm, setRegisterForm] = useState(defaultRegister);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onLogin(loginForm);
      setLoginForm(defaultLogin);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedFullName = registerForm.fullName.trim();
    const trimmedEmail = registerForm.email.trim();

    if (!trimmedFullName) {
      setError('A név megadása kötelező.');
      return;
    }

    if (trimmedFullName.length > MAX_FULL_NAME_LENGTH) {
      setError(`A név legfeljebb ${MAX_FULL_NAME_LENGTH} karakter lehet.`);
      return;
    }

    if (!EMAIL_FIRST_CHAR_REGEX.test(trimmedEmail)) {
      setError('Az email cím nem kezdődhet számmal.');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('A két jelszó nem egyezik.');
      return;
    }

    try {
      await onRegister({
        ...registerForm,
        fullName: trimmedFullName,
        email: trimmedEmail,
      });
      setRegisterForm(defaultRegister);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 5, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(180deg, rgba(15,23,42,0.9), rgba(30,41,59,0.82))' : 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>Fiók</Typography>
          <Typography variant="h5" sx={{ mt: 0.5 }}>Belépés vagy regisztráció</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
Letisztult, mégis barátságos belépőfelület gyors hozzáféréssel és jobb vizuális hangsúlyokkal.
          </Typography>
        </Box>

        <Tabs value={mode} onChange={(_, next) => { setMode(next); setError(''); }}>
          <Tab value="login" label="Bejelentkezés" />
          <Tab value="register" label="Regisztráció" />
        </Tabs>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {mode === 'login' ? (
          <Box component="form" onSubmit={handleLoginSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Email cím"
                type="email"
                placeholder="pl. user@nutrismart.hu"
                value={loginForm.email}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <PasswordField
                label="Jelszó"
                placeholder="Legalább 8 karakter"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              <Button type="submit" variant="contained" size="large" disabled={busy}>
                {busy ? 'Belépés...' : 'Belépés'}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegisterSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Teljes név"
                placeholder="pl. Kiss Anna"
                value={registerForm.fullName}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, fullName: e.target.value }))}
                inputProps={{ maxLength: MAX_FULL_NAME_LENGTH }}
                helperText={`Legfeljebb ${MAX_FULL_NAME_LENGTH} karakter.`}
                required
              />
              <TextField
                fullWidth
                label="Email cím"
                type="email"
                placeholder="pl. anna@pelda.hu"
                value={registerForm.email}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <PasswordField
                  label="Jelszó"
                  placeholder="Legalább 8 karakter"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                />
                <PasswordField
                  label="Jelszó újra"
                  placeholder="Írd be még egyszer"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </Stack>
              <Button type="submit" variant="contained" size="large" disabled={busy}>
                {busy ? 'Regisztráció...' : 'Fiók létrehozása'}
              </Button>
            </Stack>
          </Box>
        )}

      </Stack>
    </Paper>
  );
}

export default AuthPanel;

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import AuthPanel from './components/AuthPanel';
import Dashboard from './components/Dashboard';
import ProfileForm from './components/ProfileForm';
import AdminPanel from './components/AdminPanel';
import { api } from './services/api';
import { clearSession, readSession, saveSession } from './utils/storage';
import { exportWeeklyMealPlanToCsv } from './utils/weeklyExport';

const tabs = [
  { id: 'dashboard', label: 'Áttekintés', icon: <SpaceDashboardRoundedIcon fontSize="small" /> },
  { id: 'profile', label: 'Profil', icon: <PersonRoundedIcon fontSize="small" /> },
];

const marketingCards = [
  {
    title: 'Személyre szabott napi menü',
    text: 'Reggeli, ebéd és vacsora ajánlás a megadott céljaid, aktivitásod és preferenciáid alapján.',
  },
  {
    title: 'Tiszta makró áttekintés',
    text: 'Kalória, fehérje, szénhidrát és zsír jól olvasható bontásban, nem túlmagyarázva.',
  },
  {
    title: 'Átlátható napi tervezés',
    text: 'A menük, tápértékek és célok egy helyen követhetők, hogy könnyebb legyen a napi döntés.',
  },
  {
    title: 'Gyors újragenerálás',
    text: 'Egy kattintással új napi menü, valamint a heti menü letöltése.',
  },
];

const buildTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: mode === 'dark' ? '#34d399' : '#0f766e' },
    secondary: { main: mode === 'dark' ? '#a78bfa' : '#7c3aed' },
    background: mode === 'dark'
      ? { default: '#020617', paper: '#0f172a' }
      : { default: '#f5f7fb', paper: '#ffffff' },
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h3: { fontWeight: 800, letterSpacing: -0.8 },
    h4: { fontWeight: 700, letterSpacing: -0.4 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.14)' : '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: mode === 'dark' ? '0 16px 40px rgba(2, 6, 23, 0.42)' : '0 10px 30px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 18,
          minHeight: 42,
        },
        contained: {
          boxShadow: mode === 'dark' ? '0 12px 28px rgba(52, 211, 153, 0.24)' : '0 12px 26px rgba(15, 118, 110, 0.16)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const session = useMemo(() => readSession(), []);
  const [token, setToken] = useState(session.token);
  const [user, setUser] = useState(session.user);
  const [profile, setProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [mealPlanBusy, setMealPlanBusy] = useState(false);
  const [weeklyExportBusy, setWeeklyExportBusy] = useState(false);
  const [adminBusyUserId, setAdminBusyUserId] = useState(null);
  const [adminActionBusy, setAdminActionBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(session.token));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [colorMode, setColorMode] = useState(() => localStorage.getItem('nutrismart-color-mode') || 'light');

  const theme = useMemo(() => buildTheme(colorMode), [colorMode]);
  const isAdmin = user?.role === 'ADMIN';
  const navigation = isAdmin
    ? [...tabs, { id: 'admin', label: 'Admin', icon: <AdminPanelSettingsRoundedIcon fontSize="small" /> }]
    : tabs;

  useEffect(() => {
    localStorage.setItem('nutrismart-color-mode', colorMode);
  }, [colorMode]);

  useEffect(() => {
    if (!token || !user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const freshUser = await api.getCurrentUser(token);
        if (cancelled) return;

        setUser(freshUser);
        saveSession(token, freshUser);

        const [p, m] = await Promise.all([
          api.getProfile(freshUser.id, token),
          api.getTodayMealPlan(freshUser.id, token),
        ]);

        if (cancelled) return;
        setProfile(p);
        setMealPlan(m);

        if (freshUser.role === 'ADMIN') {
          const [users, foodList, recipeList] = await Promise.all([
            api.listUsers(token),
            api.listFoods(token),
            api.listRecipes(token),
          ]);

          if (!cancelled) {
            setAdminUsers(users);
            setFoods(foodList);
            setRecipes(recipeList);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          handleLogout();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, user?.id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleLogout = () => {
    clearSession();
    setToken(null);
    setUser(null);
    setProfile(null);
    setMealPlan(null);
    setAdminUsers([]);
    setFoods([]);
    setRecipes([]);
    setActiveTab('dashboard');
  };

  const handleAuthSuccess = (authResponse, message) => {
    setError('');
    saveSession(authResponse.token, authResponse.user);
    setToken(authResponse.token);
    setUser(authResponse.user);
    setToast(message);
  };

  const handleLogin = async ({ email, password }) => {
    setBusy(true);
    setError('');
    try {
      handleAuthSuccess(await api.login(email, password), 'Sikeres bejelentkezés.');
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (payload) => {
    setBusy(true);
    setError('');
    try {
      handleAuthSuccess(await api.register(payload), 'Sikeres regisztráció.');
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const handleProfileSave = async (payload) => {
    setProfileBusy(true);
    setError('');
    try {
      const updated = await api.updateProfile(user.id, payload, token);
      setProfile(updated);
      setToast('A profil adatai elmentve.');
      setMealPlan(await api.getTodayMealPlan(user.id, token));
    } catch (e) {
      setError(e.message);
    } finally {
      setProfileBusy(false);
    }
  };

  const handleGenerateMealPlan = async () => {
    setMealPlanBusy(true);
    setError('');
    try {
      setMealPlan(await api.generateMealPlan(user.id, token));
      setToast('Új napi étrend generálva.');
    } catch (e) {
      setError(e.message);
    } finally {
      setMealPlanBusy(false);
    }
  };

  const handleWeeklyExport = async () => {
    setWeeklyExportBusy(true);
    setError('');
    try {
      const weeklyPlan = await api.getWeeklyMealPlan(user.id, token);
      exportWeeklyMealPlanToCsv(weeklyPlan, profile?.fullName || user?.fullName || user?.email);
      setToast('A heti menü CSV formátumban exportálva lett.');
    } catch (e) {
      setError(e.message);
    } finally {
      setWeeklyExportBusy(false);
    }
  };

  const handleAdminUserUpdate = async (userId, update) => {
    setAdminBusyUserId(userId);
    setError('');
    try {
      const currentEntry = adminUsers.find((entry) => Number(entry.id) === Number(userId));
      const payload = {
        role: update.role || currentEntry?.role || 'USER',
        active: Object.prototype.hasOwnProperty.call(update, 'active') ? update.active : Boolean(currentEntry?.active),
      };
      const updatedUser = await api.updateUserByAdmin(userId, payload, token);
      setAdminUsers((prev) => prev.map((entry) => (
        Number(entry.id) === Number(userId)
          ? { ...entry, ...updatedUser, ...payload }
          : entry
      )));
      if (Object.prototype.hasOwnProperty.call(update, 'active')) {
        setToast(payload.active ? 'A felhasználói fiók aktiválva lett.' : 'A felhasználói fiók deaktiválva lett.');
      } else if (Object.prototype.hasOwnProperty.call(update, 'role')) {
        setToast('A felhasználó szerepköre ' + (payload.role === 'ADMIN' ? 'admin' : 'user') + ' lett.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setAdminBusyUserId(null);
    }
  };
  const handleAdminDeleteUser = async (userId) => {
    setAdminBusyUserId(userId);
    setError('');
    try {
      await api.deleteUserByAdmin(userId, token);
      setAdminUsers(await api.listUsers(token));
      setToast('A felhasználó törölve lett.');
    } catch (e) {
      setError(e.message);
    } finally {
      setAdminBusyUserId(null);
    }
  };

  const handleAdminRegenerateMealPlan = async (userId) => {
    setAdminBusyUserId(userId);
    setAdminActionBusy(true);
    setError('');
    try {
      await api.generateMealPlan(userId, token);
      if (Number(userId) === Number(user?.id)) {
        setMealPlan(await api.getTodayMealPlan(user.id, token));
      }
      setToast('Az étrend sikeresen újragenerálva.');
    } catch (e) {
      setError(e.message);
    } finally {
      setAdminBusyUserId(null);
      setAdminActionBusy(false);
    }
  };

  const handleCreateFood = async (body) => {
    setError('');
    try {
      await api.createFood(body, token);
      setFoods(await api.listFoods(token));
      setToast('Alapanyag hozzáadva.');
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const handleUpdateFood = async (id, body) => {
    setError('');
    try {
      await api.updateFood(id, body, token);
      setFoods(await api.listFoods(token));
      setToast('Alapanyag frissítve.');
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const handleDeleteFood = async (id) => {
    setError('');
    try {
      await api.deleteFood(id, token);
      const [foodList, recipeList] = await Promise.all([
        api.listFoods(token),
        api.listRecipes(token),
      ]);
      setFoods(foodList);
      setRecipes(recipeList);
      if (user?.id) setMealPlan(await api.getTodayMealPlan(user.id, token));
      setToast('Alapanyag törölve.');
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const handleCreateRecipe = async (body) => {
    setError('');
    try {
      await api.createRecipe(body, token);
      const [recipeList, foodList] = await Promise.all([
        api.listRecipes(token),
        api.listFoods(token),
      ]);
      setRecipes(recipeList);
      setFoods(foodList);
      if (user?.id) setMealPlan(await api.getTodayMealPlan(user.id, token));
      setToast('Recept hozzáadva.');
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const handleUpdateRecipe = async (id, body) => {
    setError('');
    try {
      await api.updateRecipe(id, body, token);
      setRecipes(await api.listRecipes(token));
      if (user?.id) setMealPlan(await api.getTodayMealPlan(user.id, token));
      setToast('Recept frissítve.');
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const handleDeleteRecipe = async (id) => {
    setError('');
    try {
      await api.deleteRecipe(id, token);
      setRecipes(await api.listRecipes(token));
      if (user?.id) setMealPlan(await api.getTodayMealPlan(user.id, token));
      setToast('Recept törölve.');
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #020617 0%, #0f172a 48%, #111827 100%)'
            : 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 52%, #f4f6f8 100%)',
          pb: 6,
        }}
      >
        <AppBar
          position="sticky"
          color="transparent"
          elevation={0}
          sx={{
            backdropFilter: 'blur(14px)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(2, 6, 23, 0.56)' : 'rgba(248, 250, 252, 0.78)',
            borderBottom: theme.palette.mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(15, 23, 42, 0.06)',
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              disableGutters
              sx={{
                minHeight: { xs: 60, sm: 78 },
                gap: { xs: 1, sm: 2 },
                justifyContent: 'space-between',
                flexWrap: 'nowrap',
                py: { xs: 0.75, sm: 0 },
              }}
            >
              <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center" sx={{ minWidth: 0, flexShrink: 0 }}>
                <Avatar
                  sx={{
                    width: { xs: 34, sm: 42 },
                    height: { xs: 34, sm: 42 },
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #34d399, #60a5fa)'
                      : 'linear-gradient(135deg, #0f766e, #7c3aed)',
                  }}
                >
                  <RestaurantMenuRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, lineHeight: 1.1 }}>NutriSmart</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Makróközpontú étrendtervező</Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={{ xs: 0.75, sm: 1.5 }}
                alignItems="center"
                justifyContent="flex-end"
                sx={{ minWidth: 0, flex: 1 }}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  aria-label={theme.palette.mode === 'dark' ? 'Világos mód' : 'Sötét mód'}
                  startIcon={theme.palette.mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
                  onClick={() => setColorMode((prev) => (prev === 'light' ? 'dark' : 'light'))}
                  sx={{ minWidth: { xs: 42, sm: 120 }, px: { xs: 1, sm: 2.25 } }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {theme.palette.mode === 'dark' ? 'Világos mód' : 'Sötét mód'}
                  </Box>
                </Button>

                {user ? (
                  <>
                    <Paper
                      variant="outlined"
                      sx={{
                        px: { xs: 1, sm: 1.5 },
                        py: { xs: 0.5, sm: 1 },
                        borderRadius: 3,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.72)',
                        maxWidth: { xs: 150, sm: 280 },
                        minWidth: 0,
                      }}
                    >
                      <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar sx={{ width: { xs: 28, sm: 34 }, height: { xs: 28, sm: 34 }, bgcolor: 'secondary.main', fontSize: 14, flexShrink: 0 }}>
                          {(user.fullName || user.email || 'N').slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>{user.fullName || user.email}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{user.email} • {user.role}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<LogoutRoundedIcon />}
                      onClick={handleLogout}
                      aria-label="Kijelentkezés"
                      sx={{ minWidth: { xs: 42, sm: 120 }, px: { xs: 1, sm: 2.25 } }}
                    >
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Kijelentkezés</Box>
                    </Button>
                  </>
                ) : null}
              </Stack>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="xl" sx={{ pt: 4 }}>
          {!user ? (
            <Stack spacing={3}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.15fr 0.85fr', xs: '1fr' }, gap: 3 }}>
                <Paper sx={{ p: { xs: 3, md: 4 }, overflow: 'hidden', position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: theme.palette.mode === 'dark'
                        ? 'radial-gradient(circle at top right, rgba(52,211,153,0.16), transparent 32%), radial-gradient(circle at bottom left, rgba(96,165,250,0.14), transparent 28%)'
                        : 'radial-gradient(circle at top right, rgba(15,118,110,0.12), transparent 32%), radial-gradient(circle at bottom left, rgba(124,58,237,0.1), transparent 28%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <Stack spacing={2} sx={{ position: 'relative' }}>
                    <Chip label="NutriSmart platform" color="primary" variant="outlined" sx={{ alignSelf: 'flex-start', backdropFilter: 'blur(6px)' }} />
                    <Typography variant="h3">Letisztult étrendtervezés, most már sötét móddal is.</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', xs: '1fr' }, gap: 2, pt: 1 }}>
                      {marketingCards.map((card) => (
                        <Paper
                          key={card.title}
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            borderRadius: 4,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.74)' : '#fcfcfd',
                            backgroundImage: theme.palette.mode === 'dark'
                              ? 'linear-gradient(180deg, rgba(17,24,39,0.92), rgba(15,23,42,0.84))'
                              : 'linear-gradient(180deg, #ffffff, #f8fafc)',
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={700} gutterBottom>{card.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{card.text}</Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Stack>
                </Paper>
                <AuthPanel onLogin={handleLogin} onRegister={handleRegister} busy={busy} />
              </Box>
            </Stack>
          ) : loading ? (
            <Paper sx={{ p: 6, display: 'grid', placeItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography color="text.secondary">Adatok betöltése...</Typography>
            </Paper>
          ) : (
            <Stack spacing={3}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <Paper sx={{ p: 1.5 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, next) => setActiveTab(next)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {navigation.map((tab) => (
                    <Tab key={tab.id} value={tab.id} icon={tab.icon} iconPosition="start" label={tab.label} sx={{ minHeight: 52 }} />
                  ))}
                </Tabs>
              </Paper>

              {activeTab === 'dashboard' ? (
                <Dashboard
                  user={user}
                  profile={profile}
                  mealPlan={mealPlan}
                  onGenerateMealPlan={handleGenerateMealPlan}
                  onExportWeekly={handleWeeklyExport}
                  mealPlanBusy={mealPlanBusy}
                  weeklyExportBusy={weeklyExportBusy}
                />
              ) : null}
              {activeTab === 'profile' ? (
                <ProfileForm profile={profile} onSave={handleProfileSave} busy={profileBusy} />
              ) : null}
              {activeTab === 'admin' && isAdmin ? (
                <AdminPanel
                  users={adminUsers}
                  foods={foods}
                  recipes={recipes}
                  currentUserId={user?.id}
                  onUpdateUser={handleAdminUserUpdate}
                  onDeleteUser={handleAdminDeleteUser}
                  onRegenerateMealPlan={handleAdminRegenerateMealPlan}
                  onCreateFood={handleCreateFood}
                  onUpdateFood={handleUpdateFood}
                  onDeleteFood={handleDeleteFood}
                  onCreateRecipe={handleCreateRecipe}
                  onUpdateRecipe={handleUpdateRecipe}
                  onDeleteRecipe={handleDeleteRecipe}
                  busyUserId={adminBusyUserId}
                  adminActionBusy={adminActionBusy}
                />
              ) : null}
            </Stack>
          )}
        </Container>

        <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="success" variant="filled" onClose={() => setToast('')} sx={{ width: '100%' }}>{toast}</Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;

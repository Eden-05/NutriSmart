import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

const emptyProfile = {
  fullName: '',
  email: '',
  gender: 'ferfi',
  age: 30,
  heightCm: 175,
  weightKg: 75,
  startingWeightKg: 75,
  currentWeightKg: 75,
  targetWeightKg: 75,
  waterGoalMl: 2500,
  mealsPerDay: 3,
  sleepGoalHours: 8,
  goal: 'szintentartas',
  activityLevel: 'kozepes',
  vegetarianEnabled: false,
};

function ProfileForm({ profile, onSave, busy }) {
  const [form, setForm] = useState(emptyProfile);

  useEffect(() => {
    setForm(profile || emptyProfile);
  }, [profile]);

  const handleChange = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...form,
      age: Number(form.age),
      heightCm: Number(form.heightCm),
      weightKg: Number(form.currentWeightKg || form.weightKg),
      startingWeightKg: Number(form.startingWeightKg || form.weightKg || form.currentWeightKg),
      currentWeightKg: Number(form.currentWeightKg || form.weightKg),
      targetWeightKg: Number(form.targetWeightKg || form.currentWeightKg || form.weightKg),
      waterGoalMl: Number(form.waterGoalMl || 2500),
      mealsPerDay: Number(form.mealsPerDay || 3),
      sleepGoalHours: Number(form.sleepGoalHours || 8),
    });
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>Profil</Typography>
          <Typography variant="h5" sx={{ mt: 0.5 }}>Személyes beállítások</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' }, gap: 2 }}>
              <TextField label="Teljes név" value={form.fullName || ''} onChange={handleChange('fullName')} fullWidth required />
              <TextField label="Email cím" type="email" value={form.email || ''} onChange={handleChange('email')} fullWidth required />
              <FormControl fullWidth>
                <InputLabel>Neme</InputLabel>
                <Select label="Neme" value={form.gender || 'ferfi'} onChange={handleChange('gender')}>
                  <MenuItem value="ferfi">Férfi</MenuItem>
                  <MenuItem value="no">Nő</MenuItem>
                  <MenuItem value="egyeb">Egyéb</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Életkor" type="number" value={form.age || 0} onChange={handleChange('age')} fullWidth inputProps={{ min: 12, max: 120 }} required />
              <TextField label="Magasság (cm)" type="number" value={form.heightCm || 0} onChange={handleChange('heightCm')} fullWidth inputProps={{ min: 100, max: 240 }} required />
              <TextField label="Kiinduló súly (kg)" type="number" value={form.startingWeightKg || form.weightKg || 0} onChange={handleChange('startingWeightKg')} fullWidth inputProps={{ min: 30, max: 300, step: 0.1 }} required />
              <TextField label="Aktuális súly (kg)" type="number" value={form.currentWeightKg || form.weightKg || 0} onChange={handleChange('currentWeightKg')} fullWidth inputProps={{ min: 30, max: 300, step: 0.1 }} required />
              <TextField label="Célsúly (kg)" type="number" value={form.targetWeightKg || 0} onChange={handleChange('targetWeightKg')} fullWidth inputProps={{ min: 30, max: 300, step: 0.1 }} required />
              <TextField label="Napi vízcél (ml)" type="number" value={form.waterGoalMl || 2500} onChange={handleChange('waterGoalMl')} fullWidth inputProps={{ min: 500, max: 6000, step: 100 }} />
              <TextField label="Alváscél (óra)" type="number" value={form.sleepGoalHours || 8} onChange={handleChange('sleepGoalHours')} fullWidth inputProps={{ min: 4, max: 12, step: 0.5 }} />
              <FormControl fullWidth>
                <InputLabel>Cél</InputLabel>
                <Select label="Cél" value={form.goal || 'szintentartas'} onChange={handleChange('goal')}>
                  <MenuItem value="fogyas">Fogyás</MenuItem>
                  <MenuItem value="szintentartas">Szintentartás</MenuItem>
                  <MenuItem value="tomegnoveles">Tömegnövelés</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Aktivitási szint</InputLabel>
                <Select label="Aktivitási szint" value={form.activityLevel || 'kozepes'} onChange={handleChange('activityLevel')}>
                  <MenuItem value="alacsony">Alacsony</MenuItem>
                  <MenuItem value="kozepes">Közepes</MenuItem>
                  <MenuItem value="magas">Magas</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, bgcolor: 'background.paper', color: 'text.primary' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Életmód preferenciák</Typography>
              <FormControlLabel
                control={<Switch checked={Boolean(form.vegetarianEnabled)} onChange={handleChange('vegetarianEnabled')} />}
                label="Vegetáriánus ajánlások előnyben részesítése"
              />
            </Paper>

            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" size="large" disabled={busy}>
                {busy ? 'Mentés...' : 'Profil mentése'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

export default ProfileForm;

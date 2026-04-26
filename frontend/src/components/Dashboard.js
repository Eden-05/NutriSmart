import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import GrainRoundedIcon from '@mui/icons-material/GrainRounded';
import OpacityRoundedIcon from '@mui/icons-material/OpacityRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import HotelRoundedIcon from '@mui/icons-material/HotelRounded';
import { calculateNutritionTargets, distributeCalories, getMealVisual } from '../utils/nutrition';

const formatGoal = (goal) => ({ fogyas: 'Fogyás', tomegnoveles: 'Tömegnövelés', szintentartas: 'Szintentartás' }[goal] || goal || 'Nincs megadva');
const formatActivity = (activity) => ({ alacsony: 'Alacsony aktivitás', kozepes: 'Közepes aktivitás', magas: 'Magas aktivitás' }[activity] || activity || 'Nincs megadva');
const formatKg = (value) => Number.isFinite(Number(value)) ? `${Number(value).toFixed(1).replace('.0', '')} kg` : 'Nincs megadva';

function calculateWeightProgress(profile) {
  const start = Number(profile?.startingWeightKg || profile?.weightKg || 0);
  const current = Number(profile?.currentWeightKg || profile?.weightKg || 0);
  const target = Number(profile?.targetWeightKg || 0);
  if (!start || !current || !target || start === target) {
    return { percent: 0, changed: current && start ? current - start : 0, remaining: target && current ? target - current : 0, direction: 'neutral' };
  }
  const total = Math.abs(start - target);
  const done = Math.min(total, Math.max(0, Math.abs(start - current)));
  return {
    percent: Math.round((done / total) * 100),
    changed: Number((current - start).toFixed(1)),
    remaining: Number((target - current).toFixed(1)),
    direction: target < start ? 'loss' : 'gain',
  };
}


function MetricCard({ label, value, helper, icon }) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        {icon}
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Stack>
      <Typography variant="h5">{value}</Typography>
      {helper ? <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{helper}</Typography> : null}
    </Paper>
  );
}

function MacroLine({ label, value, unit, icon }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Stack>
      <Typography variant="body2" fontWeight={700}>{value} {unit}</Typography>
    </Stack>
  );
}

function Dashboard({ user, profile, mealPlan, onGenerateMealPlan, onExportWeekly, mealPlanBusy, weeklyExportBusy }) {
  const summary = calculateNutritionTargets(profile);
  const mealTargets = distributeCalories(summary.calories);
  const meals = mealPlan?.meals || [];
  const weightProgress = calculateWeightProgress(profile);

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} justifyContent="space-between">
          <Box>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>Személyes dashboard</Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>Helló, {profile?.fullName || user.email}!</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 760 }}>
              A mai célod {summary.calories} kcal. Itt követheted a legfontosabb tápértékeket, célokat és a napi menüdet.
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
              <Chip label={`Cél: ${formatGoal(profile?.goal)}`} />
              <Chip label={`Aktivitás: ${formatActivity(profile?.activityLevel)}`} />
              <Chip label={`Vegetáriánus: ${profile?.vegetarianEnabled ? 'Igen' : 'Nem'}`} />
              <Chip label={`Célsúly: ${formatKg(profile?.targetWeightKg)}`} />
            </Stack>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={onExportWeekly} disabled={weeklyExportBusy}>
              {weeklyExportBusy ? 'Letöltés...' : 'Heti menü letöltése'}
            </Button>
            <Button variant="contained" startIcon={<AutorenewRoundedIcon />} onClick={onGenerateMealPlan} disabled={mealPlanBusy}>
              {mealPlanBusy ? 'Generálás...' : 'Mai menü frissítése'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { lg: 'repeat(5, minmax(0, 1fr))', md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' }, gap: 2 }}>
        <MetricCard label="Napi kalóriacél" value={`${summary.calories} kcal`} helper={`BMR: ${summary.bmr} • TDEE: ${summary.tdee}`} icon={<LocalFireDepartmentRoundedIcon color="primary" fontSize="small" />} />
        <MetricCard label="Fehérje" value={`${summary.protein} g`} helper="Testsúly és cél alapján" icon={<FitnessCenterRoundedIcon color="primary" fontSize="small" />} />
        <MetricCard label="Szénhidrát" value={`${summary.carbs} g`} helper="Aktivitáshoz igazítva" icon={<GrainRoundedIcon color="primary" fontSize="small" />} />
        <MetricCard label="Zsír" value={`${summary.fat} g`} helper={summary.bmi ? `BMI: ${summary.bmi}` : 'BMI nem számolható'} icon={<OpacityRoundedIcon color="primary" fontSize="small" />} />
        <MetricCard label="Súlycél haladás" value={`${weightProgress.percent}%`} helper={`Aktuális: ${formatKg(profile?.currentWeightKg || profile?.weightKg)} • Hátra: ${formatKg(Math.abs(weightProgress.remaining))}`} icon={<MonitorWeightRoundedIcon color="primary" fontSize="small" />} />
      </Box>

      <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">Valós életmód célok</Typography>
            <Typography variant="body2" color="text.secondary">Súly, folyadék, étkezésszám és alvás egy helyen, hogy ne csak a menü legyen követhető.</Typography>
          </Box>
          <Chip color="primary" variant="outlined" label={`Haladás: ${weightProgress.percent}%`} />
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(4, minmax(0, 1fr))', xs: '1fr' }, gap: 2 }}>
          <MetricCard label="Kiinduló súly" value={formatKg(profile?.startingWeightKg || profile?.weightKg)} helper={`Változás: ${weightProgress.changed > 0 ? '+' : ''}${weightProgress.changed.toFixed ? weightProgress.changed.toFixed(1) : weightProgress.changed} kg`} icon={<MonitorWeightRoundedIcon color="primary" fontSize="small" />} />
          <MetricCard label="Aktuális súly" value={formatKg(profile?.currentWeightKg || profile?.weightKg)} helper={`Célsúly: ${formatKg(profile?.targetWeightKg)}`} icon={<MonitorWeightRoundedIcon color="primary" fontSize="small" />} />
          <MetricCard label="Napi vízcél" value={`${profile?.waterGoalMl || 2500} ml`} helper="Hidratáltsági emlékeztető cél" icon={<WaterDropRoundedIcon color="primary" fontSize="small" />} />
          <MetricCard label="Alváscél" value={`${profile?.sleepGoalHours || 8} óra`} helper="Profilban beállított napi cél" icon={<HotelRoundedIcon color="primary" fontSize="small" />} />
        </Box>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">Mai ajánlott menü</Typography>
            <Typography variant="body2" color="text.secondary">Étkezésenként célértékekkel, recepttel és részletes hozzávalólistával.</Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {Object.entries(mealTargets).map(([key, value]) => (
              <Chip key={key} variant="outlined" label={`${key}: ${value} kcal`} />
            ))}
          </Stack>
        </Stack>

        {meals.length ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xl: 'repeat(3, minmax(0, 1fr))', md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' }, gap: 2 }}>
            {meals.map((meal) => {
              const visual = getMealVisual(meal.mealType);
              return (
                <Card key={meal.mealType} sx={{ borderRadius: 5, overflow: 'hidden' }}>
                  <Box sx={{ position: 'relative', height: 220 }}>
                    <Box component="img" src={meal.imageUrl || visual.image} alt={meal.mealLabel} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.74) 100%)' }} />
                    <Stack spacing={0.5} sx={{ position: 'absolute', left: 20, right: 20, bottom: 20, color: 'white' }}>
                      <Typography variant="overline" sx={{ opacity: 0.9 }}>{meal.mealLabel}</Typography>
                      <Typography variant="h6">{meal.recipeName || visual.title}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>{meal.totalCalories} / {meal.targetCalories} kcal</Typography>
                    </Stack>
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={1.2}>
                      <Typography variant="body2" color="text.secondary">{visual.subtitle}</Typography>
                      <Divider sx={{ my: 0.5 }} />
                      <MacroLine label="Fehérje" value={meal.totalProteinG} unit="g" icon={<FitnessCenterRoundedIcon fontSize="small" color="primary" />} />
                      <MacroLine label="Szénhidrát" value={meal.totalCarbsG} unit="g" icon={<GrainRoundedIcon fontSize="small" color="primary" />} />
                      <MacroLine label="Zsír" value={meal.totalFatG} unit="g" icon={<OpacityRoundedIcon fontSize="small" color="primary" />} />
                      <Divider sx={{ my: 0.5 }} />
                      <Typography variant="subtitle2">Hozzávalók</Typography>
                      <Stack spacing={1}>
                        {(meal.items || []).map((item, idx) => (
                          <Paper key={`${meal.mealType}-${idx}`} variant="outlined" sx={{ p: 1.25, borderRadius: 3, bgcolor: 'background.paper', color: 'text.primary' }}>
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                              <Box>
                                <Typography variant="body2" fontWeight={700}>{item.foodName}</Typography>
                                <Typography variant="caption" color="text.secondary">{Math.round(item.quantityG)} g</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">{item.calories} kcal</Typography>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', color: 'text.primary' }}>
            <Typography variant="body1">Még nincs generált napi menü.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Töltsd ki a profilodat, majd generálj új étrendet.</Typography>
          </Paper>
        )}

        {mealPlan?.generatedAt ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Utolsó generálás: {mealPlan.generatedAt}
          </Typography>
        ) : null}
      </Paper>
    </Stack>
  );
}

export default Dashboard;

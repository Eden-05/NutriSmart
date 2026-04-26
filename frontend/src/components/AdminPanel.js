import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

const mealOptions = ['reggeli', 'ebéd', 'vacsora'];
const emptyFood = {
  name: '',
  category: '',
  recommendedMeals: ['ebéd'],
  macroRole: 'carb',
  caloriesPer100g: 100,
  proteinPer100g: 5,
  carbsPer100g: 10,
  fatPer100g: 2,
  vegetarian: true,
  active: true,
};
const emptyRecipe = {
  name: '',
  mealType: 'ebéd',
  vegetarian: false,
  active: true,
  ingredients: [],
};

function AdminPanel({
  users,
  foods,
  recipes,
  currentUserId,
  onUpdateUser,
  onDeleteUser,
  onRegenerateMealPlan,
  onCreateFood,
  onUpdateFood,
  onDeleteFood,
  onCreateRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  busyUserId,
  adminActionBusy,
}) {
  const [tab, setTab] = useState('users');
  const [form, setForm] = useState(emptyFood);
  const [editId, setEditId] = useState(null);
  const [recipeForm, setRecipeForm] = useState(emptyRecipe);
  const [recipeEditId, setRecipeEditId] = useState(null);
  const [foodSearch, setFoodSearch] = useState('');
  const [localError, setLocalError] = useState('');

  const visibleFoods = useMemo(() => foods || [], [foods]);
  const filteredFoods = useMemo(
    () => visibleFoods.filter((food) =>
      food.name.toLowerCase().includes(foodSearch.toLowerCase())
      || (food.category || '').toLowerCase().includes(foodSearch.toLowerCase())
    ),
    [visibleFoods, foodSearch],
  );

  useEffect(() => {
    if (!editId) setForm(emptyFood);
  }, [editId]);

  const addIngredient = (_, selectedFood) => {
    if (!selectedFood) return;
    setRecipeForm((prev) => {
      if (prev.ingredients.some((item) => item.foodId === selectedFood.id)) return prev;
      const nextIngredients = [
        ...prev.ingredients,
        { foodId: selectedFood.id, foodName: selectedFood.name, quantityG: 100, itemOrder: prev.ingredients.length + 1 },
      ];
      return {
        ...prev,
        ingredients: nextIngredients,
        vegetarian: nextIngredients.every((item) => visibleFoods.find((entry) => entry.id === item.foodId)?.vegetarian),
      };
    });
  };

  const updateIngredientQty = (foodId, quantityG) => {
    setRecipeForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((item) => (item.foodId === foodId
        ? { ...item, quantityG: Math.max(5, Number(quantityG) || 5) }
        : item)),
    }));
  };

  const removeIngredient = (foodId) => {
    setRecipeForm((prev) => {
      const nextIngredients = prev.ingredients
        .filter((item) => item.foodId !== foodId)
        .map((item, index) => ({ ...item, itemOrder: index + 1 }));
      return {
        ...prev,
        ingredients: nextIngredients,
        vegetarian: nextIngredients.every((item) => visibleFoods.find((entry) => entry.id === item.foodId)?.vegetarian),
      };
    });
  };

  const handleFoodSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    if (!form.name.trim()) {
      setLocalError('Az alapanyag neve kötelező.');
      return;
    }
    if (!form.recommendedMeals.length) {
      setLocalError('Legalább egy ajánlott étkezést válassz.');
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      category: form.category.trim(),
      caloriesPer100g: Number(form.caloriesPer100g),
      proteinPer100g: Number(form.proteinPer100g),
      carbsPer100g: Number(form.carbsPer100g),
      fatPer100g: Number(form.fatPer100g),
    };

    try {
      if (editId) {
        await onUpdateFood(editId, payload);
      } else {
        await onCreateFood(payload);
      }
      setEditId(null);
      setForm(emptyFood);
    } catch (error) {
      setLocalError(error.message);
    }
  };

  const handleRecipeSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    if (!recipeForm.name.trim()) {
      setLocalError('A recept neve kötelező.');
      return;
    }
    if (!recipeForm.ingredients.length) {
      setLocalError('A recepthez legalább egy hozzávalót adj hozzá.');
      return;
    }

    try {
      const payload = {
        ...recipeForm,
        name: recipeForm.name.trim(),
        ingredients: recipeForm.ingredients.map((item, index) => ({
          foodId: item.foodId,
          quantityG: Number(item.quantityG),
          itemOrder: index + 1,
        })),
      };
      if (recipeEditId) {
        await onUpdateRecipe(recipeEditId, payload);
      } else {
        await onCreateRecipe(payload);
      }
      setRecipeEditId(null);
      setRecipeForm(emptyRecipe);
    } catch (error) {
      setLocalError(error.message);
    }
  };

  const handleDeleteFood = async (food) => {
    if (!window.confirm(`Biztosan törlöd ezt az alapanyagot: "${food.name}"? A hozzá tartozó receptek is törlődhetnek.`)) return;
    try {
      await onDeleteFood(food.id);
      if (Number(editId) === Number(food.id)) {
        setEditId(null);
        setForm(emptyFood);
      }
    } catch (error) {
      setLocalError(error.message);
    }
  };

  const startRecipeEdit = (recipe) => {
    setRecipeEditId(recipe.id);
    setRecipeForm({
      name: recipe.name || '',
      mealType: recipe.mealType || 'ebéd',
      vegetarian: Boolean(recipe.vegetarian),
      active: recipe.active !== false,
      ingredients: (recipe.ingredients || []).map((item, index) => ({
        foodId: item.foodId,
        foodName: item.foodName || visibleFoods.find((food) => food.id === item.foodId)?.name || 'Alapanyag',
        quantityG: item.quantityG || 100,
        itemOrder: item.itemOrder || index + 1,
      })),
    });
  };

  const handleDeleteRecipe = async (recipe) => {
    if (!window.confirm(`Biztosan törlöd ezt a receptet: "${recipe.name}"?`)) return;
    try {
      await onDeleteRecipe(recipe.id);
      if (Number(recipeEditId) === Number(recipe.id)) {
        setRecipeEditId(null);
        setRecipeForm(emptyRecipe);
      }
    } catch (error) {
      setLocalError(error.message);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
          <Box>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>Admin</Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>Felhasználók, alapanyagok, receptek</Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`${users.length} felhasználó`} />
            <Chip label={`${foods.length} alapanyag`} />
            <Chip label={`${recipes.length} recept`} />
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1.5 }}>
        <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="scrollable" scrollButtons="auto">
          <Tab value="users" label="Felhasználók" />
          <Tab value="foods" label="Alapanyagok" />
          <Tab value="recipes" label="Receptek" />
        </Tabs>
      </Paper>

      {localError ? <Alert severity="error">{localError}</Alert> : null}

      {tab === 'users' ? (
        <Stack spacing={2}>
          {users.map((entry) => {
            const busy = Number(busyUserId) === Number(entry.id);
            return (
              <Paper key={entry.id} sx={{ p: 2.5 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between">
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
                      <Chip label={entry.role} color={entry.role === 'ADMIN' ? 'primary' : 'default'} size="small" />
                      <Chip label={entry.active ? 'Aktív' : 'Inaktív'} color={entry.active ? 'success' : 'warning'} variant={entry.active ? 'filled' : 'outlined'} size="small" />
                      {Number(entry.id) === Number(currentUserId) ? <Chip label="Jelenlegi felhasználó" size="small" variant="outlined" /> : null}
                    </Stack>
                    <Typography variant="subtitle1" fontWeight={700}>{entry.fullName || 'Névtelen felhasználó'}</Typography>
                    <Typography variant="body2" color="text.secondary">{entry.email}</Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                    <FormControl size="small" sx={{ minWidth: 150 }} disabled={busy || Number(entry.id) === Number(currentUserId)}>
                      <InputLabel>Szerepkör</InputLabel>
                      <Select
                        label="Szerepkör"
                        value={entry.role}
                        onChange={(event) => onUpdateUser(entry.id, { role: event.target.value, active: entry.active })}
                      >
                        <MenuItem value="USER">User</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={() => onUpdateUser(entry.id, { active: !entry.active, role: entry.role })}
                      disabled={busy || Number(entry.id) === Number(currentUserId)}
                    >
                      {entry.active ? 'Deaktiválás' : 'Aktiválás'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AutorenewRoundedIcon />}
                      onClick={() => onRegenerateMealPlan(entry.id)}
                      disabled={busy || adminActionBusy}
                    >
                      Étrend újragenerálása
                    </Button>
                    <Button
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      onClick={() => onDeleteUser(entry.id)}
                      disabled={busy || Number(entry.id) === Number(currentUserId)}
                    >
                      Törlés
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : null}

      {tab === 'foods' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { lg: '0.95fr 1.05fr', xs: '1fr' }, gap: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">{editId ? 'Alapanyag szerkesztése' : 'Új alapanyag'}</Typography>
            <Box component="form" onSubmit={handleFoodSubmit} sx={{ mt: 2 }}>
              <Stack spacing={2}>
                <TextField label="Név" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
                <TextField label="Kategória" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
                <FormControl fullWidth>
                  <InputLabel>Makró szerep</InputLabel>
                  <Select label="Makró szerep" value={form.macroRole} onChange={(e) => setForm((prev) => ({ ...prev, macroRole: e.target.value }))}>
                    <MenuItem value="protein">Fehérje</MenuItem>
                    <MenuItem value="carb">Szénhidrát</MenuItem>
                    <MenuItem value="fat">Zsír</MenuItem>
                    <MenuItem value="mixed">Vegyes</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Ajánlott étkezések</InputLabel>
                  <Select
                    multiple
                    label="Ajánlott étkezések"
                    value={form.recommendedMeals}
                    onChange={(e) => setForm((prev) => ({ ...prev, recommendedMeals: e.target.value }))}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {mealOptions.map((meal) => <MenuItem key={meal} value={meal}>{meal}</MenuItem>)}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
                  <TextField label="Kalória / 100g" type="number" value={form.caloriesPer100g} onChange={(e) => setForm((prev) => ({ ...prev, caloriesPer100g: e.target.value }))} />
                  <TextField label="Fehérje / 100g" type="number" value={form.proteinPer100g} onChange={(e) => setForm((prev) => ({ ...prev, proteinPer100g: e.target.value }))} />
                  <TextField label="Szénhidrát / 100g" type="number" value={form.carbsPer100g} onChange={(e) => setForm((prev) => ({ ...prev, carbsPer100g: e.target.value }))} />
                  <TextField label="Zsír / 100g" type="number" value={form.fatPer100g} onChange={(e) => setForm((prev) => ({ ...prev, fatPer100g: e.target.value }))} />
                </Box>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel sx={{ color: 'text.primary', bgcolor: 'transparent' }} control={<Switch color="success" checked={Boolean(form.vegetarian)} onChange={(e) => setForm((prev) => ({ ...prev, vegetarian: e.target.checked }))} />} label="Vegetáriánus" />
                  <FormControlLabel control={<Switch checked={Boolean(form.active)} onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))} />} label="Aktív" />
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <Button type="submit" variant="contained">{editId ? 'Módosítás mentése' : 'Alapanyag mentése'}</Button>
                  {editId ? <Button variant="outlined" onClick={() => { setEditId(null); setForm(emptyFood); }}>Mégse</Button> : null}
                </Stack>
              </Stack>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Alapanyagadatbázis</Typography>
              <TextField label="Keresés" value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} placeholder="Név vagy kategória" />
              <Stack spacing={1.5}>
                {filteredFoods.map((food) => (
                  <Paper key={food.id} variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: 'background.paper', color: 'text.primary' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{food.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{food.category || 'Nincs kategória'} • {food.caloriesPer100g} kcal / 100g</Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                          <Chip label={food.macroRole} size="small" />
                          <Chip label={food.vegetarian ? 'Vegetáriánus' : 'Nem vegetáriánus'} size="small" />
                          <Chip label={food.active ? 'Aktív' : 'Inaktív'} size="small" />
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" onClick={() => { setEditId(food.id); setForm({ ...food, recommendedMeals: food.recommendedMeals || [] }); }}>
                          Szerkesztés
                        </Button>
                        <Button color="error" variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => handleDeleteFood(food)}>
                          Törlés
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Box>
      ) : null}

      {tab === 'recipes' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { lg: '0.95fr 1.05fr', xs: '1fr' }, gap: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">{recipeEditId ? 'Recept szerkesztése' : 'Új recept'}</Typography>
            <Box component="form" onSubmit={handleRecipeSubmit} sx={{ mt: 2 }}>
              <Stack spacing={2}>
                <TextField label="Recept neve" value={recipeForm.name} onChange={(e) => setRecipeForm((prev) => ({ ...prev, name: e.target.value }))} required />
                <FormControl fullWidth>
                  <InputLabel>Étkezés típusa</InputLabel>
                  <Select label="Étkezés típusa" value={recipeForm.mealType} onChange={(e) => setRecipeForm((prev) => ({ ...prev, mealType: e.target.value }))}>
                    {mealOptions.map((meal) => <MenuItem key={meal} value={meal}>{meal}</MenuItem>)}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel sx={{ color: 'text.primary', bgcolor: 'transparent' }} control={<Switch color="success" checked={Boolean(recipeForm.vegetarian)} onChange={(e) => setRecipeForm((prev) => ({ ...prev, vegetarian: e.target.checked }))} />} label="Vegetáriánus" />
                  <FormControlLabel control={<Switch checked={Boolean(recipeForm.active)} onChange={(e) => setRecipeForm((prev) => ({ ...prev, active: e.target.checked }))} />} label="Aktív" />
                </Stack>
                <Autocomplete
                  options={visibleFoods}
                  getOptionLabel={(option) => `${option.name} (${option.category || 'egyéb'})`}
                  onChange={addIngredient}
                  renderInput={(params) => <TextField {...params} label="Alapanyag hozzáadása" placeholder="Alapanyag keresése" />}
                />
                <Stack spacing={1.25}>
                  {recipeForm.ingredients.map((ingredient) => (
                    <Paper key={ingredient.foodId} variant="outlined" sx={{ p: 1.5, borderRadius: 3, bgcolor: 'background.paper', color: 'text.primary' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                        <Typography variant="body2" fontWeight={700}>{ingredient.foodName}</Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <TextField
                            label="Mennyiség (g)"
                            type="number"
                            size="small"
                            value={ingredient.quantityG}
                            onChange={(e) => updateIngredientQty(ingredient.foodId, e.target.value)}
                            sx={{ width: 150 }}
                          />
                          <Button color="error" onClick={() => removeIngredient(ingredient.foodId)}>Eltávolítás</Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <Button type="submit" variant="contained">{recipeEditId ? 'Módosítás mentése' : 'Recept mentése'}</Button>
                  {recipeEditId ? <Button variant="outlined" onClick={() => { setRecipeEditId(null); setRecipeForm(emptyRecipe); }}>Mégse</Button> : null}
                </Stack>
              </Stack>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Meglévő receptek</Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {recipes.map((recipe) => (
                <Paper key={recipe.id} variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: 'background.paper', color: 'text.primary' }}>
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{recipe.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{recipe.mealType}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip label={recipe.vegetarian ? 'Vegetáriánus' : 'Normál'} size="small" />
                        <Chip label={recipe.active ? 'Aktív' : 'Inaktív'} size="small" />
                      </Stack>
                    </Stack>
                    <Divider />
                    <Typography variant="body2" color="text.secondary">
                      {(recipe.ingredients || []).map((item) => `${item.foodName || item.foodId} (${item.quantityG} g)`).join(', ')}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" onClick={() => startRecipeEdit(recipe)}>
                        Szerkesztés
                      </Button>
                      <Button color="error" variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => handleDeleteRecipe(recipe)}>
                        Törlés
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Box>
      ) : null}
    </Stack>
  );
}

export default AdminPanel;

const formatNumber = (value) => {
  const numeric = Number(value || 0);
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1).replace('.', ',');
};

const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export function exportWeeklyMealPlanToCsv(weeklyPlan, fullName = 'felhasznalo') {
  const headers = [
    'Dátum',
    'Nap',
    'Étkezés',
    'Recept',
    'Cél kcal',
    'Tényleges kcal',
    'Fehérje (g)',
    'Szénhidrát (g)',
    'Zsír (g)',
    'Összetevők',
  ];

  const rows = [headers];

  (weeklyPlan?.days || []).forEach((day) => {
    (day.meals || []).forEach((meal) => {
      rows.push([
        day.date,
        day.label,
        meal.mealLabel,
        meal.recipeName,
        formatNumber(meal.targetCalories),
        formatNumber(meal.totalCalories),
        formatNumber(meal.totalProteinG),
        formatNumber(meal.totalCarbsG),
        formatNumber(meal.totalFatG),
        meal.items.map((item) => `${item.foodName} (${Math.round(item.quantityG)} g)`).join(', '),
      ]);
    });
    rows.push([
      day.date,
      `${day.label} összesen`,
      'Napi összesítés',
      '',
      '',
      formatNumber(day.totalCalories),
      formatNumber(day.totalProteinG),
      formatNumber(day.totalCarbsG),
      formatNumber(day.totalFatG),
      '',
    ]);
  });

  const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(';')).join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = String(fullName || 'felhasznalo').trim().toLowerCase().replace(/[^a-z0-9áéíóöőúüű-]+/gi, '-');
  link.href = url;
  link.download = `heti-menu-${safeName || 'felhasznalo'}-${weeklyPlan?.startDate || 'export'}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

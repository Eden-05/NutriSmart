import breakfastImage from '../assets/breakfast.jpg';
import lunchImage from '../assets/lunch.jpg';
import dinnerImage from '../assets/dinner.jpg';

const mealVisuals = {
  reggeli: {
    title: 'Tápláló reggeli',
    subtitle: 'Stabil indulás fehérjével és lassú felszívódású szénhidráttal',
    image: breakfastImage,
    accent: 'sunrise',
  },
  ebéd: {
    title: 'Kiegyensúlyozott ebéd',
    subtitle: 'Napi főenergiafrissítés zöldséggel és komplett fogással',
    image: lunchImage,
    accent: 'garden',
  },
  vacsora: {
    title: 'Könnyű vacsora',
    subtitle: 'Estére tervezett, mégis laktató összeállítás',
    image: dinnerImage,
    accent: 'evening',
  },
};

function getProteinMultiplier(goal) {
  return {
    szintentartas: 1.0,
    fogyas: 1.9,
    tomegnoveles: 1.9,
  }[goal] || 1.0;
}

function getCarbMultiplier(goal, activityLevel) {
  if (goal === 'fogyas' || activityLevel === 'alacsony') return 2.5;
  if (activityLevel === 'magas') return 5.5;
  return 4;
}

function getFatMultiplier(goal) {
  if (goal === 'fogyas') return 0.7;
  return 0.9;
}

export function calculateNutritionTargets(profile) {
  if (!profile) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, bmi: null, bmr: 0, tdee: 0 };
  }

  const weight = Number(profile.currentWeightKg || profile.weightKg || 0);
  const height = Number(profile.heightCm || 0);
  const age = Number(profile.age || 30);
  const bmr = calculateBmr(profile.gender, weight, height, age);
  const activityMultiplier = {
    alacsony: 1.2,
    kozepes: 1.55,
    magas: 1.725,
  }[profile.activityLevel] || 1.375;

  const tdee = Math.round(bmr * activityMultiplier);
  const goalAdjust = {
    fogyas: -450,
    szintentartas: 0,
    tomegnoveles: 300,
  }[profile.goal] || 0;

  const calories = Math.max(1200, Math.round(tdee + goalAdjust));
  const protein = Math.max(0, Math.round(weight * getProteinMultiplier(profile.goal)));
  const carbs = Math.max(0, Math.round(weight * getCarbMultiplier(profile.goal, profile.activityLevel)));
  const fat = Math.max(0, Math.round(weight * getFatMultiplier(profile.goal)));

  return { calories, protein, carbs, fat, bmi: calculateBmi(weight, height), bmr, tdee };
}

export function calculateBmr(gender, weight, height, age) {
  if (!weight || !height || !age) return 0;
  if (gender === 'no') return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

export function calculateBmi(weight, heightCm) {
  if (!weight || !heightCm) return null;
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

export function distributeCalories(totalCalories) {
  const breakfast = Math.round(totalCalories * 0.3);
  const lunch = Math.round(totalCalories * 0.4);
  const dinner = totalCalories - breakfast - lunch;
  return { reggeli: breakfast, ebéd: lunch, vacsora: dinner };
}

export function mealTypeLabel(mealType) {
  return { reggeli: 'Reggeli', ebéd: 'Ebéd', vacsora: 'Vacsora' }[mealType] || mealType;
}

export function getMealVisual(mealType) {
  return mealVisuals[mealType] || mealVisuals.reggeli;
}

export function formatNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value).toLocaleString('hu-HU') : value;
}

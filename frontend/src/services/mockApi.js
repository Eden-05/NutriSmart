const USERS_KEY = 'nutri_users';
const PROFILES_KEY = 'nutri_profiles';
const MEAL_PLANS_KEY = 'nutri_meal_plans';
const FOODS_KEY = 'nutri_foods';
const RECIPES_KEY = 'nutri_recipes';
const delay = () => new Promise((resolve) => setTimeout(resolve, 80));
const mealTargets = { reggeli: 0.28, ebéd: 0.4, vacsora: 0.32 };
const mealOrder = ['reggeli', 'ebéd', 'vacsora'];
const mealLabels = { reggeli: 'Reggeli', ebéd: 'Ebéd', vacsora: 'Vacsora' };

const foodSeed = [
  { name: 'Zabpehely', category: 'gabonák', recommendedMeals: ['reggeli'], macroRole: 'carb', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatPer100g: 6.9, vegetarian: true, active: true },
  { name: 'Skyr', category: 'tejtermék', recommendedMeals: ['reggeli'], macroRole: 'protein', caloriesPer100g: 63, proteinPer100g: 11, carbsPer100g: 4, fatPer100g: 0.2, vegetarian: true, active: true },
  { name: 'Görög joghurt', category: 'tejtermék', recommendedMeals: ['reggeli'], macroRole: 'protein', caloriesPer100g: 97, proteinPer100g: 9, carbsPer100g: 3.9, fatPer100g: 5, vegetarian: true, active: true },
  { name: 'Banán', category: 'gyümölcs', recommendedMeals: ['reggeli'], macroRole: 'carb', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3, vegetarian: true, active: true },
  { name: 'Áfonya', category: 'gyümölcs', recommendedMeals: ['reggeli'], macroRole: 'carb', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14.5, fatPer100g: 0.3, vegetarian: true, active: true },
  { name: 'Eper', category: 'gyümölcs', recommendedMeals: ['reggeli'], macroRole: 'carb', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3, vegetarian: true, active: true },
  { name: 'Alma', category: 'gyümölcs', recommendedMeals: ['reggeli', 'vacsora'], macroRole: 'carb', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 13.8, fatPer100g: 0.2, vegetarian: true, active: true },
  { name: 'Mogyoróvaj', category: 'krém', recommendedMeals: ['reggeli'], macroRole: 'fat', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, vegetarian: true, active: true },
  { name: 'Chia mag', category: 'mag', recommendedMeals: ['reggeli'], macroRole: 'fat', caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31, vegetarian: true, active: true },
  { name: 'Mandula', category: 'olajos mag', recommendedMeals: ['reggeli'], macroRole: 'fat', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, vegetarian: true, active: true },
  { name: 'Dió', category: 'olajos mag', recommendedMeals: ['reggeli', 'vacsora'], macroRole: 'fat', caloriesPer100g: 654, proteinPer100g: 15.2, carbsPer100g: 13.7, fatPer100g: 65.2, vegetarian: true, active: true },
  { name: 'Tojás', category: 'fehérjeforrás', recommendedMeals: ['reggeli'], macroRole: 'protein', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, vegetarian: true, active: true },
  { name: 'Teljes kiőrlésű kenyér', category: 'pékáru', recommendedMeals: ['reggeli', 'vacsora'], macroRole: 'carb', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 4.2, vegetarian: true, active: true },
  { name: 'Avokádó', category: 'gyümölcs', recommendedMeals: ['reggeli'], macroRole: 'fat', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 14.7, vegetarian: true, active: true },
  { name: 'Csirkemell', category: 'hús', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'protein', caloriesPer100g: 120, proteinPer100g: 22.5, carbsPer100g: 0, fatPer100g: 2.6, vegetarian: false, active: true },
  { name: 'Pulykamell', category: 'hús', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'protein', caloriesPer100g: 114, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 1.2, vegetarian: false, active: true },
  { name: 'Lazac', category: 'hal', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'protein', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, vegetarian: false, active: true },
  { name: 'Tonhal', category: 'hal', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'protein', caloriesPer100g: 132, proteinPer100g: 29, carbsPer100g: 0, fatPer100g: 1, vegetarian: false, active: true },
  { name: 'Tofu', category: 'növényi fehérje', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'protein', caloriesPer100g: 144, proteinPer100g: 17, carbsPer100g: 3, fatPer100g: 9, vegetarian: true, active: true },
  { name: 'Csicseriborsó', category: 'hüvelyes', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'protein', caloriesPer100g: 164, proteinPer100g: 9, carbsPer100g: 27, fatPer100g: 2.6, vegetarian: true, active: true },
  { name: 'Vöröslencse', category: 'hüvelyes', recommendedMeals: ['ebéd'], macroRole: 'protein', caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4, vegetarian: true, active: true },
  { name: 'Barna rizs', category: 'köret', recommendedMeals: ['ebéd'], macroRole: 'carb', caloriesPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 25.6, fatPer100g: 1, vegetarian: true, active: true },
  { name: 'Quinoa', category: 'köret', recommendedMeals: ['ebéd'], macroRole: 'carb', caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21.3, fatPer100g: 1.9, vegetarian: true, active: true },
  { name: 'Bulgur', category: 'köret', recommendedMeals: ['ebéd'], macroRole: 'carb', caloriesPer100g: 83, proteinPer100g: 3.1, carbsPer100g: 18.6, fatPer100g: 0.2, vegetarian: true, active: true },
  { name: 'Kuszkusz', category: 'köret', recommendedMeals: ['ebéd'], macroRole: 'carb', caloriesPer100g: 112, proteinPer100g: 3.8, carbsPer100g: 23.2, fatPer100g: 0.2, vegetarian: true, active: true },
  { name: 'Burgonya', category: 'köret', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'carb', caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17, fatPer100g: 0.1, vegetarian: true, active: true },
  { name: 'Édesburgonya', category: 'köret', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'carb', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20.1, fatPer100g: 0.1, vegetarian: true, active: true },
  { name: 'Brokkoli', category: 'zöldség', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'carb', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, vegetarian: true, active: true },
  { name: 'Cukkini', category: 'zöldség', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'carb', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, vegetarian: true, active: true },
  { name: 'Spenót', category: 'zöldség', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'carb', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, vegetarian: true, active: true },
  { name: 'Paradicsom', category: 'zöldség', recommendedMeals: ['reggeli', 'ebéd', 'vacsora'], macroRole: 'carb', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, vegetarian: true, active: true },
  { name: 'Uborka', category: 'zöldség', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'carb', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, vegetarian: true, active: true },
  { name: 'Paprika', category: 'zöldség', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'carb', caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3, vegetarian: true, active: true },
  { name: 'Olívaolaj', category: 'zsiradék', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'fat', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, vegetarian: true, active: true },
  { name: 'Feta', category: 'sajt', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'fat', caloriesPer100g: 264, proteinPer100g: 14, carbsPer100g: 4, fatPer100g: 21, vegetarian: true, active: true },
  { name: 'Tahini', category: 'krém', recommendedMeals: ['ebéd', 'vacsora'], macroRole: 'fat', caloriesPer100g: 595, proteinPer100g: 17, carbsPer100g: 21, fatPer100g: 54, vegetarian: true, active: true },
  { name: 'Humusz', category: 'krém', recommendedMeals: ['vacsora'], macroRole: 'protein', caloriesPer100g: 166, proteinPer100g: 8, carbsPer100g: 14, fatPer100g: 10, vegetarian: true, active: true },
  { name: 'Túró', category: 'tejtermék', recommendedMeals: ['reggeli', 'vacsora'], macroRole: 'protein', caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3, vegetarian: true, active: true },
  { name: 'Mozzarella light', category: 'sajt', recommendedMeals: ['vacsora'], macroRole: 'protein', caloriesPer100g: 180, proteinPer100g: 24, carbsPer100g: 2, fatPer100g: 8, vegetarian: true, active: true },
  { name: 'Teljes kiőrlésű tortilla', category: 'pékáru', recommendedMeals: ['vacsora'], macroRole: 'carb', caloriesPer100g: 300, proteinPer100g: 8, carbsPer100g: 48, fatPer100g: 7, vegetarian: true, active: true },
  { name: 'Rozskenyér', category: 'pékáru', recommendedMeals: ['vacsora'], macroRole: 'carb', caloriesPer100g: 242, proteinPer100g: 8.5, carbsPer100g: 48.3, fatPer100g: 3.3, vegetarian: true, active: true },
  { name: 'Olívabogyó', category: 'zöldség', recommendedMeals: ['vacsora'], macroRole: 'fat', caloriesPer100g: 115, proteinPer100g: 0.8, carbsPer100g: 6.3, fatPer100g: 10.7, vegetarian: true, active: true },
  { name: 'Krémsajt light', category: 'tejtermék', recommendedMeals: ['reggeli'], macroRole: 'protein', caloriesPer100g: 185, proteinPer100g: 8, carbsPer100g: 4, fatPer100g: 15, vegetarian: true, active: true },
  { name: 'Zabital', category: 'ital', recommendedMeals: ['reggeli'], macroRole: 'carb', caloriesPer100g: 46, proteinPer100g: 1, carbsPer100g: 6.7, fatPer100g: 1.5, vegetarian: true, active: true },
  { name: 'Proteinpor', category: 'kiegészítő', recommendedMeals: ['reggeli'], macroRole: 'protein', caloriesPer100g: 390, proteinPer100g: 78, carbsPer100g: 8, fatPer100g: 5, vegetarian: true, active: true },
];

const recipeSeed = [
  { id: 1, name: 'Skyr zabkása áfonyával', mealType: 'reggeli', vegetarian: true, active: true, ingredients: [{ foodId: 1, quantityG: 65, itemOrder: 1 }, { foodId: 2, quantityG: 200, itemOrder: 2 }, { foodId: 5, quantityG: 100, itemOrder: 3 }, { foodId: 10, quantityG: 15, itemOrder: 4 }] },
  { id: 2, name: 'Tojásos avokádós pirítós', mealType: 'reggeli', vegetarian: true, active: true, ingredients: [{ foodId: 12, quantityG: 120, itemOrder: 1 }, { foodId: 13, quantityG: 90, itemOrder: 2 }, { foodId: 14, quantityG: 70, itemOrder: 3 }, { foodId: 30, quantityG: 80, itemOrder: 4 }] },
  { id: 3, name: 'Joghurtos chia tál eperrel', mealType: 'reggeli', vegetarian: true, active: true, ingredients: [{ foodId: 3, quantityG: 180, itemOrder: 1 }, { foodId: 9, quantityG: 20, itemOrder: 2 }, { foodId: 6, quantityG: 140, itemOrder: 3 }, { foodId: 4, quantityG: 90, itemOrder: 4 }] },
  { id: 4, name: 'Túrós-almás reggeli tál', mealType: 'reggeli', vegetarian: true, active: true, ingredients: [{ foodId: 38, quantityG: 180, itemOrder: 1 }, { foodId: 7, quantityG: 140, itemOrder: 2 }, { foodId: 1, quantityG: 45, itemOrder: 3 }, { foodId: 11, quantityG: 15, itemOrder: 4 }] },
  { id: 5, name: 'Protein smoothie bowl', mealType: 'reggeli', vegetarian: true, active: true, ingredients: [{ foodId: 44, quantityG: 250, itemOrder: 1 }, { foodId: 45, quantityG: 30, itemOrder: 2 }, { foodId: 4, quantityG: 100, itemOrder: 3 }, { foodId: 5, quantityG: 80, itemOrder: 4 }, { foodId: 9, quantityG: 12, itemOrder: 5 }] },
  { id: 6, name: 'Skyr-körte pohárkrém', mealType: 'reggeli', vegetarian: true, active: true, ingredients: [{ foodId: 2, quantityG: 200, itemOrder: 1 }, { foodId: 7, quantityG: 140, itemOrder: 2 }, { foodId: 1, quantityG: 40, itemOrder: 3 }, { foodId: 10, quantityG: 12, itemOrder: 4 }] },
  { id: 7, name: 'Fahéjas overnight oats almával', mealType: 'reggeli', vegetarian: true, active: true, ingredients: [{ foodId: 1, quantityG: 60, itemOrder: 1 }, { foodId: 44, quantityG: 220, itemOrder: 2 }, { foodId: 7, quantityG: 130, itemOrder: 3 }, { foodId: 8, quantityG: 18, itemOrder: 4 }, { foodId: 9, quantityG: 12, itemOrder: 5 }] },
  { id: 8, name: 'Túrós-banános fehérje krém', mealType: 'reggeli', vegetarian: true, active: true, ingredients: [{ foodId: 38, quantityG: 200, itemOrder: 1 }, { foodId: 4, quantityG: 120, itemOrder: 2 }, { foodId: 45, quantityG: 20, itemOrder: 3 }, { foodId: 10, quantityG: 12, itemOrder: 4 }] },
  { id: 9, name: 'Skyr granola jellegű tál dióval', mealType: 'reggeli', vegetarian: true, active: true, ingredients: [{ foodId: 2, quantityG: 220, itemOrder: 1 }, { foodId: 1, quantityG: 45, itemOrder: 2 }, { foodId: 5, quantityG: 90, itemOrder: 3 }, { foodId: 11, quantityG: 14, itemOrder: 4 }] },
  { id: 10, name: 'Csirkemell barna rizzsel és brokkolival', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 15, quantityG: 170, itemOrder: 1 }, { foodId: 22, quantityG: 220, itemOrder: 2 }, { foodId: 28, quantityG: 150, itemOrder: 3 }, { foodId: 34, quantityG: 10, itemOrder: 4 }] },
  { id: 11, name: 'Lazac quinoa salátával', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 17, quantityG: 160, itemOrder: 1 }, { foodId: 23, quantityG: 180, itemOrder: 2 }, { foodId: 31, quantityG: 120, itemOrder: 3 }, { foodId: 30, quantityG: 120, itemOrder: 4 }, { foodId: 34, quantityG: 10, itemOrder: 5 }] },
  { id: 12, name: 'Tofus bulgur tál', mealType: 'ebéd', vegetarian: true, active: true, ingredients: [{ foodId: 19, quantityG: 180, itemOrder: 1 }, { foodId: 24, quantityG: 220, itemOrder: 2 }, { foodId: 28, quantityG: 140, itemOrder: 3 }, { foodId: 35, quantityG: 15, itemOrder: 4 }] },
  { id: 13, name: 'Lencsés édesburgonya tál', mealType: 'ebéd', vegetarian: true, active: true, ingredients: [{ foodId: 21, quantityG: 220, itemOrder: 1 }, { foodId: 27, quantityG: 220, itemOrder: 2 }, { foodId: 30, quantityG: 100, itemOrder: 3 }, { foodId: 34, quantityG: 35, itemOrder: 4 }] },
  { id: 14, name: 'Pulykamell kuszkusszal', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 16, quantityG: 170, itemOrder: 1 }, { foodId: 25, quantityG: 220, itemOrder: 2 }, { foodId: 29, quantityG: 160, itemOrder: 3 }, { foodId: 34, quantityG: 10, itemOrder: 4 }] },
  { id: 15, name: 'Csicseriborsós quinoa saláta', mealType: 'ebéd', vegetarian: true, active: true, ingredients: [{ foodId: 20, quantityG: 180, itemOrder: 1 }, { foodId: 23, quantityG: 170, itemOrder: 2 }, { foodId: 31, quantityG: 120, itemOrder: 3 }, { foodId: 30, quantityG: 120, itemOrder: 4 }, { foodId: 34, quantityG: 30, itemOrder: 5 }] },
  { id: 16, name: 'Tonhalas rizstál', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 18, quantityG: 140, itemOrder: 1 }, { foodId: 22, quantityG: 210, itemOrder: 2 }, { foodId: 20, quantityG: 120, itemOrder: 3 }, { foodId: 31, quantityG: 80, itemOrder: 4 }] },
  { id: 17, name: 'Spenótos tofu kuszkusszal', mealType: 'ebéd', vegetarian: true, active: true, ingredients: [{ foodId: 19, quantityG: 170, itemOrder: 1 }, { foodId: 25, quantityG: 210, itemOrder: 2 }, { foodId: 30, quantityG: 120, itemOrder: 3 }, { foodId: 34, quantityG: 8, itemOrder: 4 }] },
  { id: 18, name: 'Mediterrán csirkés bulgur tál', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 15, quantityG: 165, itemOrder: 1 }, { foodId: 24, quantityG: 210, itemOrder: 2 }, { foodId: 31, quantityG: 120, itemOrder: 3 }, { foodId: 42, quantityG: 25, itemOrder: 4 }, { foodId: 35, quantityG: 28, itemOrder: 5 }] },
  { id: 19, name: 'Pulykás quinoa cukkini serpenyő', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 16, quantityG: 170, itemOrder: 1 }, { foodId: 23, quantityG: 190, itemOrder: 2 }, { foodId: 29, quantityG: 170, itemOrder: 3 }, { foodId: 34, quantityG: 12, itemOrder: 4 }] },
  { id: 20, name: 'Sült édesburgonyás csicseri bowl fetával', mealType: 'ebéd', vegetarian: true, active: true, ingredients: [{ foodId: 27, quantityG: 240, itemOrder: 1 }, { foodId: 20, quantityG: 170, itemOrder: 2 }, { foodId: 28, quantityG: 130, itemOrder: 3 }, { foodId: 35, quantityG: 30, itemOrder: 4 }, { foodId: 34, quantityG: 8, itemOrder: 5 }] },
  { id: 21, name: 'Lazacos kuszkusz saláta uborkával', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 17, quantityG: 150, itemOrder: 1 }, { foodId: 25, quantityG: 190, itemOrder: 2 }, { foodId: 32, quantityG: 130, itemOrder: 3 }, { foodId: 31, quantityG: 110, itemOrder: 4 }, { foodId: 34, quantityG: 8, itemOrder: 5 }] },
  { id: 22, name: 'Tonhalas tortilla paprikával', mealType: 'vacsora', vegetarian: false, active: true, ingredients: [{ foodId: 18, quantityG: 120, itemOrder: 1 }, { foodId: 40, quantityG: 70, itemOrder: 2 }, { foodId: 33, quantityG: 100, itemOrder: 3 }, { foodId: 42, quantityG: 35, itemOrder: 4 }] },
  { id: 23, name: 'Túrós szendvics zöldségekkel', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 38, quantityG: 180, itemOrder: 1 }, { foodId: 41, quantityG: 90, itemOrder: 2 }, { foodId: 31, quantityG: 120, itemOrder: 3 }, { foodId: 32, quantityG: 120, itemOrder: 4 }] },
  { id: 24, name: 'Mozzarellás wrap humusszal', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 39, quantityG: 100, itemOrder: 1 }, { foodId: 40, quantityG: 70, itemOrder: 2 }, { foodId: 37, quantityG: 40, itemOrder: 3 }, { foodId: 32, quantityG: 100, itemOrder: 4 }] },
  { id: 25, name: 'Sült burgonya túrókrémmel', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 26, quantityG: 250, itemOrder: 1 }, { foodId: 38, quantityG: 160, itemOrder: 2 }, { foodId: 33, quantityG: 80, itemOrder: 3 }, { foodId: 34, quantityG: 5, itemOrder: 4 }] },
  { id: 26, name: 'Lazacos saláta fetával', mealType: 'vacsora', vegetarian: false, active: true, ingredients: [{ foodId: 17, quantityG: 140, itemOrder: 1 }, { foodId: 29, quantityG: 120, itemOrder: 2 }, { foodId: 31, quantityG: 120, itemOrder: 3 }, { foodId: 32, quantityG: 100, itemOrder: 4 }, { foodId: 35, quantityG: 30, itemOrder: 5 }] },
  { id: 27, name: 'Tofus tortilla humusszal', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 19, quantityG: 160, itemOrder: 1 }, { foodId: 40, quantityG: 70, itemOrder: 2 }, { foodId: 37, quantityG: 35, itemOrder: 3 }, { foodId: 32, quantityG: 100, itemOrder: 4 }] },
  { id: 28, name: 'Pulykás rozskenyér szendvics', mealType: 'vacsora', vegetarian: false, active: true, ingredients: [{ foodId: 16, quantityG: 130, itemOrder: 1 }, { foodId: 41, quantityG: 100, itemOrder: 2 }, { foodId: 31, quantityG: 90, itemOrder: 3 }, { foodId: 32, quantityG: 90, itemOrder: 4 }, { foodId: 42, quantityG: 20, itemOrder: 5 }] },
  { id: 29, name: 'Csicseriborsós feta saláta', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 20, quantityG: 180, itemOrder: 1 }, { foodId: 32, quantityG: 120, itemOrder: 2 }, { foodId: 31, quantityG: 120, itemOrder: 3 }, { foodId: 35, quantityG: 35, itemOrder: 4 }, { foodId: 41, quantityG: 25, itemOrder: 5 }] },
  { id: 30, name: 'Caprese tortilla könnyű vacsora', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 40, quantityG: 75, itemOrder: 1 }, { foodId: 39, quantityG: 95, itemOrder: 2 }, { foodId: 31, quantityG: 130, itemOrder: 3 }, { foodId: 34, quantityG: 6, itemOrder: 4 }] },
  { id: 31, name: 'Csirkés zöldséges wrap', mealType: 'vacsora', vegetarian: false, active: true, ingredients: [{ foodId: 15, quantityG: 140, itemOrder: 1 }, { foodId: 40, quantityG: 75, itemOrder: 2 }, { foodId: 32, quantityG: 100, itemOrder: 3 }, { foodId: 33, quantityG: 90, itemOrder: 4 }, { foodId: 37, quantityG: 30, itemOrder: 5 }] },
  { id: 32, name: 'Túrókrémes rozskenyér almával', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 38, quantityG: 170, itemOrder: 1 }, { foodId: 41, quantityG: 90, itemOrder: 2 }, { foodId: 7, quantityG: 120, itemOrder: 3 }, { foodId: 10, quantityG: 10, itemOrder: 4 }] },
  { id: 33, name: 'Lazacos burgonyasaláta light', mealType: 'vacsora', vegetarian: false, active: true, ingredients: [{ foodId: 17, quantityG: 130, itemOrder: 1 }, { foodId: 26, quantityG: 220, itemOrder: 2 }, { foodId: 32, quantityG: 110, itemOrder: 3 }, { foodId: 31, quantityG: 110, itemOrder: 4 }, { foodId: 34, quantityG: 6, itemOrder: 5 }] },
  { id: 34, name: 'Citromos csirkés rizstál', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 15, quantityG: 170, itemOrder: 1 }, { foodId: 22, quantityG: 200, itemOrder: 2 }, { foodId: 33, quantityG: 120, itemOrder: 3 }, { foodId: 31, quantityG: 120, itemOrder: 4 }, { foodId: 34, quantityG: 10, itemOrder: 5 }] },
  { id: 35, name: 'Pulykamell sült burgonyával és brokkolival', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 16, quantityG: 180, itemOrder: 1 }, { foodId: 26, quantityG: 260, itemOrder: 2 }, { foodId: 28, quantityG: 150, itemOrder: 3 }, { foodId: 34, quantityG: 12, itemOrder: 4 }] },
  { id: 36, name: 'Lazacos bulgur serpenyő', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 17, quantityG: 150, itemOrder: 1 }, { foodId: 24, quantityG: 220, itemOrder: 2 }, { foodId: 29, quantityG: 160, itemOrder: 3 }, { foodId: 34, quantityG: 10, itemOrder: 4 }] },
  { id: 37, name: 'Tonhalas quinoa saláta', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 18, quantityG: 150, itemOrder: 1 }, { foodId: 23, quantityG: 200, itemOrder: 2 }, { foodId: 31, quantityG: 120, itemOrder: 3 }, { foodId: 32, quantityG: 120, itemOrder: 4 }, { foodId: 34, quantityG: 8, itemOrder: 5 }] },
  { id: 38, name: 'Csirkés édesburgonya spenót tál', mealType: 'ebéd', vegetarian: false, active: true, ingredients: [{ foodId: 15, quantityG: 160, itemOrder: 1 }, { foodId: 27, quantityG: 230, itemOrder: 2 }, { foodId: 30, quantityG: 140, itemOrder: 3 }, { foodId: 35, quantityG: 25, itemOrder: 4 }, { foodId: 34, quantityG: 6, itemOrder: 5 }] },
  { id: 39, name: 'Tahinis tofu quinoa bowl', mealType: 'ebéd', vegetarian: true, active: true, ingredients: [{ foodId: 19, quantityG: 180, itemOrder: 1 }, { foodId: 23, quantityG: 200, itemOrder: 2 }, { foodId: 28, quantityG: 160, itemOrder: 3 }, { foodId: 36, quantityG: 18, itemOrder: 4 }] },
  { id: 40, name: 'Vöröslencsés rizstál spenóttal', mealType: 'ebéd', vegetarian: true, active: true, ingredients: [{ foodId: 21, quantityG: 240, itemOrder: 1 }, { foodId: 22, quantityG: 180, itemOrder: 2 }, { foodId: 30, quantityG: 140, itemOrder: 3 }, { foodId: 34, quantityG: 12, itemOrder: 4 }] },
  { id: 41, name: 'Csicseris bulgur bowl tahinivel', mealType: 'ebéd', vegetarian: true, active: true, ingredients: [{ foodId: 20, quantityG: 190, itemOrder: 1 }, { foodId: 24, quantityG: 220, itemOrder: 2 }, { foodId: 33, quantityG: 120, itemOrder: 3 }, { foodId: 36, quantityG: 20, itemOrder: 4 }] },
  { id: 42, name: 'Tofus édesburgonya cukkini tál', mealType: 'ebéd', vegetarian: true, active: true, ingredients: [{ foodId: 19, quantityG: 170, itemOrder: 1 }, { foodId: 27, quantityG: 240, itemOrder: 2 }, { foodId: 29, quantityG: 180, itemOrder: 3 }, { foodId: 34, quantityG: 10, itemOrder: 4 }] },
  { id: 43, name: 'Csicseriborsós quinoa uborkasaláta', mealType: 'ebéd', vegetarian: true, active: true, ingredients: [{ foodId: 20, quantityG: 180, itemOrder: 1 }, { foodId: 23, quantityG: 180, itemOrder: 2 }, { foodId: 32, quantityG: 140, itemOrder: 3 }, { foodId: 31, quantityG: 130, itemOrder: 4 }, { foodId: 34, quantityG: 8, itemOrder: 5 }] },
  { id: 44, name: 'Csirkés tortilla humusszal', mealType: 'vacsora', vegetarian: false, active: true, ingredients: [{ foodId: 15, quantityG: 130, itemOrder: 1 }, { foodId: 40, quantityG: 80, itemOrder: 2 }, { foodId: 37, quantityG: 35, itemOrder: 3 }, { foodId: 31, quantityG: 110, itemOrder: 4 }, { foodId: 33, quantityG: 90, itemOrder: 5 }] },
  { id: 45, name: 'Pulykás rozskenyér krémsajttal', mealType: 'vacsora', vegetarian: false, active: true, ingredients: [{ foodId: 16, quantityG: 140, itemOrder: 1 }, { foodId: 41, quantityG: 110, itemOrder: 2 }, { foodId: 43, quantityG: 35, itemOrder: 3 }, { foodId: 32, quantityG: 110, itemOrder: 4 }] },
  { id: 46, name: 'Lazacos tortilla spenóttal', mealType: 'vacsora', vegetarian: false, active: true, ingredients: [{ foodId: 17, quantityG: 130, itemOrder: 1 }, { foodId: 40, quantityG: 75, itemOrder: 2 }, { foodId: 32, quantityG: 110, itemOrder: 3 }, { foodId: 30, quantityG: 100, itemOrder: 4 }] },
  { id: 47, name: 'Tonhalas burgonyasaláta', mealType: 'vacsora', vegetarian: false, active: true, ingredients: [{ foodId: 18, quantityG: 120, itemOrder: 1 }, { foodId: 26, quantityG: 240, itemOrder: 2 }, { foodId: 31, quantityG: 120, itemOrder: 3 }, { foodId: 34, quantityG: 6, itemOrder: 4 }] },
  { id: 48, name: 'Csirkés burgonya-humusz tányér', mealType: 'vacsora', vegetarian: false, active: true, ingredients: [{ foodId: 15, quantityG: 150, itemOrder: 1 }, { foodId: 26, quantityG: 220, itemOrder: 2 }, { foodId: 33, quantityG: 100, itemOrder: 3 }, { foodId: 37, quantityG: 30, itemOrder: 4 }] },
  { id: 49, name: 'Tofus avokádós szendvics', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 19, quantityG: 160, itemOrder: 1 }, { foodId: 41, quantityG: 80, itemOrder: 2 }, { foodId: 14, quantityG: 60, itemOrder: 3 }, { foodId: 31, quantityG: 100, itemOrder: 4 }] },
  { id: 50, name: 'Csicseris tortilla paprikával', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 20, quantityG: 170, itemOrder: 1 }, { foodId: 40, quantityG: 60, itemOrder: 2 }, { foodId: 37, quantityG: 30, itemOrder: 3 }, { foodId: 33, quantityG: 110, itemOrder: 4 }] },
  { id: 51, name: 'Mediterrán túrós burgonyatál', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 38, quantityG: 180, itemOrder: 1 }, { foodId: 26, quantityG: 230, itemOrder: 2 }, { foodId: 31, quantityG: 120, itemOrder: 3 }, { foodId: 34, quantityG: 6, itemOrder: 4 }] },
  { id: 52, name: 'Mozzarellás rozskenyér olívával', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 39, quantityG: 95, itemOrder: 1 }, { foodId: 41, quantityG: 100, itemOrder: 2 }, { foodId: 31, quantityG: 130, itemOrder: 3 }, { foodId: 42, quantityG: 25, itemOrder: 4 }] },
  { id: 53, name: 'Lencsés burgonyasaláta fetával', mealType: 'vacsora', vegetarian: true, active: true, ingredients: [{ foodId: 21, quantityG: 180, itemOrder: 1 }, { foodId: 26, quantityG: 220, itemOrder: 2 }, { foodId: 32, quantityG: 120, itemOrder: 3 }, { foodId: 35, quantityG: 25, itemOrder: 4 }, { foodId: 34, quantityG: 5, itemOrder: 5 }] },
];

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seededFoods() {
  return foodSeed.map((food, index) => ({ ...food, id: index + 1, imageUrl: '' }));
}

function seededRecipes() {
  return recipeSeed.map((recipe, index) => ({ ...recipe, id: index + 1 }));
}

function syncFoodsWithSeed() {
  const existing = read(FOODS_KEY, []);
  const existingByName = new Map(existing.map((food) => [String(food.name).toLowerCase(), food]));
  const merged = seededFoods().map((seedFood) => {
    const current = existingByName.get(String(seedFood.name).toLowerCase());
    return current ? { ...seedFood, ...current, id: seedFood.id, imageUrl: current.imageUrl || '' } : seedFood;
  });
  write(FOODS_KEY, merged);
  return merged;
}

function syncRecipesWithSeed() {
  const existing = read(RECIPES_KEY, []);
  const existingByName = new Map(existing.map((recipe) => [String(recipe.name).toLowerCase(), recipe]));
  const merged = [...seededRecipes()];
  const usedIds = new Set(merged.map((recipe) => recipe.id));

  existing.forEach((recipe) => {
    const key = String(recipe.name).toLowerCase();
    const defaultRecipe = merged.find((item) => String(item.name).toLowerCase() === key);
    if (defaultRecipe) {
      Object.assign(defaultRecipe, { ...defaultRecipe, ...recipe, id: defaultRecipe.id });
      return;
    }
    let nextId = Number(recipe.id);
    if (!nextId || usedIds.has(nextId)) {
      nextId = Math.max(0, ...Array.from(usedIds)) + 1;
    }
    usedIds.add(nextId);
    merged.push({ ...recipe, id: nextId });
  });

  write(RECIPES_KEY, merged);
  return merged;
}

function seed() {
  if (!read(USERS_KEY)) {
    write(USERS_KEY, [
      { id: 1, email: 'admin@nutrismart.hu', password: 'admin12345', fullName: 'Admin', role: 'ADMIN', active: true },
      { id: 2, email: 'user@nutrismart.hu', password: 'user12345', fullName: 'Demo User', role: 'USER', active: true },
    ]);
  }
  if (!read(PROFILES_KEY)) {
    write(PROFILES_KEY, {
      1: { id: 1, email: 'admin@nutrismart.hu', fullName: 'Admin', gender: 'egyeb', age: 35, heightCm: 180, weightKg: 82, startingWeightKg: 84, currentWeightKg: 82, targetWeightKg: 80, waterGoalMl: 2800, mealsPerDay: 3, sleepGoalHours: 7.5, goal: 'szintentartas', activityLevel: 'kozepes', vegetarianEnabled: false },
      2: { id: 2, email: 'user@nutrismart.hu', fullName: 'Demo User', gender: 'no', age: 29, heightCm: 175, weightKg: 74, startingWeightKg: 78, currentWeightKg: 74, targetWeightKg: 68, waterGoalMl: 2500, mealsPerDay: 3, sleepGoalHours: 8, goal: 'fogyas', activityLevel: 'kozepes', vegetarianEnabled: false },
    });
  }
  syncFoodsWithSeed();
  syncRecipesWithSeed();
  if (!read(MEAL_PLANS_KEY)) {
    const profiles = read(PROFILES_KEY, {});
    write(MEAL_PLANS_KEY, { 1: generateMealPlanForProfile(profiles[1]), 2: generateMealPlanForProfile(profiles[2]) });
  }
}

function tokenFor(user) {
  return `mock-token-${user.id}`;
}

function getUserFromToken(token) {
  const id = Number(String(token || '').split('-').pop());
  return read(USERS_KEY, []).find((user) => user.id === id);
}

function caloriesFor(food, quantityG) {
  return Math.round((food.caloriesPer100g * quantityG) / 100);
}

function macroFor(food, quantityG, key) {
  return Math.round(((food[key] * quantityG) / 100) * 10) / 10;
}

function summarizeRecipe(recipe, foods) {
  const ingredients = recipe.ingredients.map((item) => {
    const food = foods.find((entry) => entry.id === item.foodId);
    return {
      ...item,
      foodName: food?.name || 'Ismeretlen összetevő',
      calories: food ? caloriesFor(food, item.quantityG) : 0,
      proteinG: food ? macroFor(food, item.quantityG, 'proteinPer100g') : 0,
      carbsG: food ? macroFor(food, item.quantityG, 'carbsPer100g') : 0,
      fatG: food ? macroFor(food, item.quantityG, 'fatPer100g') : 0,
    };
  });

  return {
    ...recipe,
    ingredients,
    totalCalories: ingredients.reduce((sum, item) => sum + item.calories, 0),
    totalProteinG: Math.round(ingredients.reduce((sum, item) => sum + item.proteinG, 0) * 10) / 10,
    totalCarbsG: Math.round(ingredients.reduce((sum, item) => sum + item.carbsG, 0) * 10) / 10,
    totalFatG: Math.round(ingredients.reduce((sum, item) => sum + item.fatG, 0) * 10) / 10,
  };
}

function roundQuantity(quantityG) {
  return Math.max(10, Math.round(quantityG / 5) * 5);
}

function calculateRecipeScale(baseCalories, targetCalories) {
  const safeBase = Math.max(1, Number(baseCalories) || 0);
  const safeTarget = Math.max(1, Number(targetCalories) || 0);
  return Math.max(0.75, Math.min(3, safeTarget / safeBase));
}

function scaleRecipe(recipe, targetCalories, foods) {
  if (!recipe) return null;
  const scale = calculateRecipeScale(recipe.totalCalories, targetCalories);
  const ingredients = (recipe.ingredients || []).map((item) => {
    const food = foods.find((entry) => entry.id === item.foodId);
    const quantityG = roundQuantity((item.quantityG || 0) * scale);
    return {
      ...item,
      quantityG,
      calories: food ? caloriesFor(food, quantityG) : 0,
      proteinG: food ? macroFor(food, quantityG, 'proteinPer100g') : 0,
      carbsG: food ? macroFor(food, quantityG, 'carbsPer100g') : 0,
      fatG: food ? macroFor(food, quantityG, 'fatPer100g') : 0,
    };
  });

  return {
    ...recipe,
    scale,
    ingredients,
    totalCalories: ingredients.reduce((sum, item) => sum + item.calories, 0),
    totalProteinG: Math.round(ingredients.reduce((sum, item) => sum + item.proteinG, 0) * 10) / 10,
    totalCarbsG: Math.round(ingredients.reduce((sum, item) => sum + item.carbsG, 0) * 10) / 10,
    totalFatG: Math.round(ingredients.reduce((sum, item) => sum + item.fatG, 0) * 10) / 10,
  };
}

function calculateCalories(profile) {
  const weight = Number(profile?.weightKg || 70);
  const height = Number(profile?.heightCm || 170);
  const age = Number(profile?.age || 30);
  const female = profile?.gender === 'no';
  const bmr = female ? (10 * weight + 6.25 * height - 5 * age - 161) : (10 * weight + 6.25 * height - 5 * age + 5);
  const activity = profile?.activityLevel === 'magas' ? 1.72 : profile?.activityLevel === 'alacsony' ? 1.3 : 1.52;
  const tdee = Math.round(bmr * activity);
  if (profile?.goal === 'fogyas') return Math.max(1350, tdee - 400);
  if (profile?.goal === 'tomegnoveles') return tdee + 250;
  return tdee;
}

function buildRecipePool(profile) {
  const foods = read(FOODS_KEY, seededFoods());
  const recipes = read(RECIPES_KEY, seededRecipes()).map((recipe) => summarizeRecipe(recipe, foods));
  return {
    foods,
    recipes: recipes.filter((recipe) => recipe.active && (!profile?.vegetarianEnabled || recipe.vegetarian)),
  };
}

function pickRecipe(candidates, targetCalories, excludedRecipeNames = []) {
  const excluded = new Set((excludedRecipeNames || []).filter(Boolean).map((name) => String(name).toLowerCase()));
  const filtered = excluded.size ? candidates.filter((candidate) => !excluded.has(String(candidate.name).toLowerCase())) : candidates;
  const pool = filtered.length ? filtered : candidates;
  const sorted = [...pool].sort((a, b) => Math.abs(a.totalCalories - targetCalories) - Math.abs(b.totalCalories - targetCalories));
  if (!sorted.length) return null;
  if (sorted.length === 1) return sorted[0];
  const bestDistance = Math.abs(sorted[0].totalCalories - targetCalories);
  const topBucket = sorted.filter((candidate) => Math.abs(candidate.totalCalories - targetCalories) <= bestDistance + 120);
  return topBucket[Math.floor(Math.random() * topBucket.length)] || sorted[0];
}

function buildMealEntry(mealType, recipe, targetCalories, foods) {
  const scaledRecipe = scaleRecipe(recipe, targetCalories, foods);
  return {
    mealType,
    mealLabel: mealLabels[mealType] || mealType,
    recipeName: scaledRecipe?.name || '',
    targetCalories,
    totalCalories: scaledRecipe?.totalCalories || 0,
    totalProteinG: scaledRecipe?.totalProteinG || 0,
    totalCarbsG: scaledRecipe?.totalCarbsG || 0,
    totalFatG: scaledRecipe?.totalFatG || 0,
    imageUrl: '',
    items: (scaledRecipe?.ingredients || []).map((item, index) => ({
      id: `${mealType}-${index + 1}`,
      foodId: item.foodId,
      foodName: item.foodName,
      category: foods.find((food) => food.id === item.foodId)?.category || '',
      quantityG: item.quantityG,
      calories: item.calories,
      proteinG: item.proteinG,
      carbsG: item.carbsG,
      fatG: item.fatG,
      imageUrl: '',
    })),
  };
}

function generateMealPlanForProfile(profile, previousPlan = null) {
  const { foods, recipes } = buildRecipePool(profile);
  const totalTarget = calculateCalories(profile);
  const meals = mealOrder.map((mealType) => {
    const targetCalories = Math.round(totalTarget * mealTargets[mealType]);
    const candidates = recipes.filter((recipe) => recipe.mealType === mealType);
    const previousRecipeName = previousPlan?.meals?.find((meal) => meal.mealType === mealType)?.recipeName || null;
    const recipe = pickRecipe(candidates, targetCalories, previousRecipeName ? [previousRecipeName] : []);
    return buildMealEntry(mealType, recipe, targetCalories, foods);
  });

  return {
    id: 1,
    userId: profile?.id,
    date: new Date().toISOString().slice(0, 10),
    targetCalories: totalTarget,
    totalCalories: meals.reduce((sum, meal) => sum + meal.totalCalories, 0),
    totalProteinG: Math.round(meals.reduce((sum, meal) => sum + meal.totalProteinG, 0) * 10) / 10,
    totalCarbsG: Math.round(meals.reduce((sum, meal) => sum + meal.totalCarbsG, 0) * 10) / 10,
    totalFatG: Math.round(meals.reduce((sum, meal) => sum + meal.totalFatG, 0) * 10) / 10,
    meals,
  };
}

function createWeeklyMealPlan(profile, startDate = new Date()) {
  const { foods, recipes } = buildRecipePool(profile);
  const totalTarget = calculateCalories(profile);
  const start = new Date(startDate);
  const recipeHistory = { reggeli: [], ebéd: [], vacsora: [] };
  const days = Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + index);
    const date = currentDate.toISOString().slice(0, 10);
    const meals = mealOrder.map((mealType) => {
      const targetCalories = Math.round(totalTarget * mealTargets[mealType]);
      const candidates = recipes.filter((recipe) => recipe.mealType === mealType);
      const recentRecipes = recipeHistory[mealType].slice(-3);
      const recipe = pickRecipe(candidates, targetCalories, recentRecipes);
      if (recipe?.name) recipeHistory[mealType].push(recipe.name);
      return buildMealEntry(mealType, recipe, targetCalories, foods);
    });

    return {
      date,
      label: currentDate.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric', weekday: 'long' }),
      totalCalories: meals.reduce((sum, meal) => sum + meal.totalCalories, 0),
      totalProteinG: Math.round(meals.reduce((sum, meal) => sum + meal.totalProteinG, 0) * 10) / 10,
      totalCarbsG: Math.round(meals.reduce((sum, meal) => sum + meal.totalCarbsG, 0) * 10) / 10,
      totalFatG: Math.round(meals.reduce((sum, meal) => sum + meal.totalFatG, 0) * 10) / 10,
      meals,
    };
  });

  return {
    userId: profile?.id,
    generatedAt: new Date().toISOString(),
    startDate: days[0]?.date,
    endDate: days[days.length - 1]?.date,
    targetCalories: totalTarget,
    days,
  };
}

seed();

export const mockApi = {
  async login(email, password) {
    await delay();
    const user = read(USERS_KEY, []).find((entry) => entry.email === email && entry.password === password && entry.active);
    if (!user) throw new Error('Hibás e-mail vagy jelszó.');
    return { token: tokenFor(user), user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, active: user.active } };
  },
  async register({ email, password, fullName }) {
    await delay();
    const users = read(USERS_KEY, []);
    const user = { id: users.length + 1, email, password, fullName, role: 'USER', active: true };
    users.push(user);
    write(USERS_KEY, users);
    const profiles = read(PROFILES_KEY, {});
    profiles[user.id] = { id: user.id, email, fullName, gender: 'no', age: 30, heightCm: 170, weightKg: 70, startingWeightKg: 70, currentWeightKg: 70, targetWeightKg: 70, waterGoalMl: 2500, mealsPerDay: 3, sleepGoalHours: 8, goal: 'szintentartas', activityLevel: 'kozepes', vegetarianEnabled: false };
    write(PROFILES_KEY, profiles);
    const plans = read(MEAL_PLANS_KEY, {});
    plans[user.id] = generateMealPlanForProfile(profiles[user.id]);
    write(MEAL_PLANS_KEY, plans);
    return { token: tokenFor(user), user: { id: user.id, email, fullName, role: 'USER', active: true } };
  },
  async getCurrentUser(token) {
    await delay();
    const user = getUserFromToken(token);
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role, active: user.active };
  },
  async getProfile(userId) {
    await delay();
    return read(PROFILES_KEY, {})[userId];
  },
  async updateProfile(userId, profile) {
    await delay();
    const profiles = read(PROFILES_KEY, {});
    profiles[userId] = {
      ...profile,
      weightKg: Number(profile.currentWeightKg || profile.weightKg || 0),
      startingWeightKg: Number(profile.startingWeightKg || profile.weightKg || profile.currentWeightKg || 0),
      currentWeightKg: Number(profile.currentWeightKg || profile.weightKg || 0),
      targetWeightKg: Number(profile.targetWeightKg || profile.currentWeightKg || profile.weightKg || 0),
      waterGoalMl: Number(profile.waterGoalMl || 2500),
      mealsPerDay: Number(profile.mealsPerDay || 3),
      sleepGoalHours: Number(profile.sleepGoalHours || 8),
    };
    write(PROFILES_KEY, profiles);
    const plans = read(MEAL_PLANS_KEY, {});
    plans[userId] = generateMealPlanForProfile(profiles[userId]);
    write(MEAL_PLANS_KEY, plans);
    return profiles[userId];
  },
  async getTodayMealPlan(userId) {
    await delay();
    const plans = read(MEAL_PLANS_KEY, {});
    if (!plans[userId]) {
      const profiles = read(PROFILES_KEY, {});
      plans[userId] = generateMealPlanForProfile(profiles[userId]);
      write(MEAL_PLANS_KEY, plans);
    }
    return plans[userId];
  },
  async getWeeklyMealPlan(userId) {
    await delay();
    const profiles = read(PROFILES_KEY, {});
    return createWeeklyMealPlan(profiles[userId]);
  },
  async generateMealPlan(userId) {
    await delay();
    const profiles = read(PROFILES_KEY, {});
    const plans = read(MEAL_PLANS_KEY, {});
    const previousPlan = plans[userId] || null;
    plans[userId] = generateMealPlanForProfile(profiles[userId], previousPlan);
    write(MEAL_PLANS_KEY, plans);
    return plans[userId];
  },
  async listUsers() {
    await delay();
    return read(USERS_KEY, []).map(({ password, ...user }) => user);
  },
  async updateUserByAdmin(userId, body) {
    await delay();
    const numericUserId = Number(userId);
    const users = read(USERS_KEY, []).map((user) => (Number(user.id) === numericUserId ? { ...user, ...body } : user));
    write(USERS_KEY, users);
    return users.find((user) => Number(user.id) === numericUserId);
  },
  async deleteUserByAdmin(userId) {
    await delay();
    write(USERS_KEY, read(USERS_KEY, []).filter((user) => user.id !== userId));
    return true;
  },
  async listFoods() {
    await delay();
    return read(FOODS_KEY, []);
  },
  async createFood(body) {
    await delay();
    const foods = read(FOODS_KEY, []);
    const created = { ...body, id: foods.length + 1, imageUrl: '' };
    foods.push(created);
    write(FOODS_KEY, foods);
    return created;
  },
  async updateFood(id, body) {
    await delay();
    const numericId = Number(id);
    const foods = read(FOODS_KEY, []).map((food) => (Number(food.id) === numericId ? { ...food, ...body, id: numericId, imageUrl: '' } : food));
    write(FOODS_KEY, foods);
    return foods.find((food) => Number(food.id) === numericId);
  },
  async deleteFood(id) {
    await delay();
    const numericId = Number(id);
    write(FOODS_KEY, read(FOODS_KEY, []).filter((food) => Number(food.id) !== numericId));
    write(RECIPES_KEY, read(RECIPES_KEY, seededRecipes()).filter((recipe) => !(recipe.ingredients || []).some((item) => Number(item.foodId) === numericId)));
    return true;
  },
  async listRecipes() {
    await delay();
    const foods = read(FOODS_KEY, []);
    return read(RECIPES_KEY, seededRecipes()).map((recipe) => summarizeRecipe(recipe, foods));
  },
  async createRecipe(body) {
    await delay();
    const recipes = read(RECIPES_KEY, seededRecipes());
    const foods = read(FOODS_KEY, []);
    const created = {
      ...body,
      id: recipes.length + 1,
      active: true,
      vegetarian: body.ingredients.every((item) => foods.find((food) => food.id === item.foodId)?.vegetarian),
    };
    recipes.push(created);
    write(RECIPES_KEY, recipes);
    const profiles = read(PROFILES_KEY, {});
    const plans = read(MEAL_PLANS_KEY, {});
    Object.keys(profiles).forEach((id) => {
      plans[id] = generateMealPlanForProfile(profiles[id]);
    });
    write(MEAL_PLANS_KEY, plans);
    return created;
  },
  async updateRecipe(id, body) {
    await delay();
    const numericId = Number(id);
    const recipes = read(RECIPES_KEY, seededRecipes()).map((recipe) => (Number(recipe.id) === numericId ? { ...recipe, ...body, id: numericId } : recipe));
    write(RECIPES_KEY, recipes);
    return recipes.find((recipe) => Number(recipe.id) === numericId);
  },
  async deleteRecipe(id) {
    await delay();
    const numericId = Number(id);
    write(RECIPES_KEY, read(RECIPES_KEY, seededRecipes()).filter((recipe) => Number(recipe.id) !== numericId));
    return true;
  },
};

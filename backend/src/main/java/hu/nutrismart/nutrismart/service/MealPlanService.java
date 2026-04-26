package hu.nutrismart.nutrismart.service;

import hu.nutrismart.nutrismart.dto.MealPlanDto;
import hu.nutrismart.nutrismart.dto.RecipeDto;
import hu.nutrismart.nutrismart.entity.*;
import hu.nutrismart.nutrismart.exception.NotFoundException;
import hu.nutrismart.nutrismart.repository.MealPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

@Service
public class MealPlanService {
    private final MealPlanRepository mealPlanRepository;
    private final UserService userService;
    private final RecipeService recipeService;
    public MealPlanService(MealPlanRepository mealPlanRepository, UserService userService, RecipeService recipeService) {
        this.mealPlanRepository = mealPlanRepository;
        this.userService = userService;
        this.recipeService = recipeService;
    }
    public MealPlanDto getTodayPlan(Long userId) {
        MealPlan plan = mealPlanRepository.findByUserIdAndPlanDate(userId, LocalDate.now())
                .orElseGet(() -> createAndSavePlan(userService.findUserById(userId), userService.findProfileEntityByUserId(userId)));
        return toDto(plan, userService.findProfileEntityByUserId(userId));
    }
    @Transactional
    public MealPlanDto generatePlan(Long userId) {
        User user = userService.findUserById(userId);
        UserProfile profile = userService.findProfileEntityByUserId(userId);
        Map<String, String> excludedRecipes = new HashMap<>();
        mealPlanRepository.findByUserIdAndPlanDate(userId, LocalDate.now()).ifPresent(existingPlan -> {
            existingPlan.getItems().stream()
                    .filter(item -> item.getMealType() != null && item.getRecipeName() != null && !item.getRecipeName().isBlank())
                    .forEach(item -> excludedRecipes.putIfAbsent(item.getMealType(), item.getRecipeName()));
            mealPlanRepository.delete(existingPlan);
            mealPlanRepository.flush();
        });
        return toDto(createAndSavePlan(user, profile, excludedRecipes), profile);
    }
    private MealPlan createAndSavePlan(User user, UserProfile profile) {
        return createAndSavePlan(user, profile, Collections.emptyMap());
    }
    private MealPlan createAndSavePlan(User user, UserProfile profile, Map<String, String> excludedRecipes) {
        MealPlan plan = new MealPlan();
        plan.setUser(user);
        plan.setPlanDate(LocalDate.now());
        int target = calculateTargetCalories(profile);
        int[] targets = distributeCalories(target);
        List<MealPlanItem> items = new ArrayList<>();
        int order = 1;
        order = appendRecipe(plan, items, pickRecipe("reggeli", Boolean.TRUE.equals(profile.getVegetarianEnabled()), targets[0], excludedRecipes.get("reggeli")), targets[0], order);
        order = appendRecipe(plan, items, pickRecipe("ebéd", Boolean.TRUE.equals(profile.getVegetarianEnabled()), targets[1], excludedRecipes.get("ebéd")), targets[1], order);
        appendRecipe(plan, items, pickRecipe("vacsora", Boolean.TRUE.equals(profile.getVegetarianEnabled()), targets[2], excludedRecipes.get("vacsora")), targets[2], order);
        plan.setItems(items);
        plan.setTotalCalories(items.stream().mapToInt(MealPlanItem::getCalories).sum());
        plan.setTotalProteinG(round1(items.stream().mapToDouble(MealPlanItem::getProteinG).sum()));
        plan.setTotalCarbsG(round1(items.stream().mapToDouble(MealPlanItem::getCarbsG).sum()));
        plan.setTotalFatG(round1(items.stream().mapToDouble(MealPlanItem::getFatG).sum()));
        plan.setNotes(Boolean.TRUE.equals(profile.getVegetarianEnabled()) ? "Vega étrend" : "Normál étrend");
        return mealPlanRepository.save(plan);
    }
    private Recipe pickRecipe(String mealType, boolean vegetarianOnly, int targetCalories, String excludedRecipeName) {
        List<Recipe> candidates = recipeService.getRecipesForMeal(mealType, vegetarianOnly);
        if (candidates.isEmpty()) throw new NotFoundException("Nincs elérhető recept ehhez az étkezéshez: " + mealType);

        List<Recipe> filtered = candidates.stream()
                .filter(recipe -> excludedRecipeName == null || !recipe.getName().equalsIgnoreCase(excludedRecipeName))
                .toList();
        List<Recipe> pool = filtered.isEmpty() ? candidates : filtered;

        List<Recipe> sorted = pool.stream()
                .sorted(Comparator.comparingInt(recipe -> Math.abs(totalCalories(recipe) - targetCalories)))
                .toList();
        if (sorted.size() == 1) {
            return sorted.get(0);
        }

        int bestDistance = Math.abs(totalCalories(sorted.get(0)) - targetCalories);
        List<Recipe> topBucket = sorted.stream()
                .filter(recipe -> Math.abs(totalCalories(recipe) - targetCalories) <= bestDistance + 120)
                .toList();
        return topBucket.get(new Random().nextInt(topBucket.size()));
    }
    private int appendRecipe(MealPlan plan, List<MealPlanItem> items, Recipe recipe, int target, int startOrder) {
        double baseCalories = Math.max(1.0, totalCalories(recipe));
        double scale = Math.max(0.75, Math.min(3.0, target / baseCalories));
        int order = startOrder;
        for (RecipeIngredient ingredient : recipe.getIngredients()) {
            Food food = ingredient.getFood();
            items.add(createItem(plan, recipe, food, ingredient.getQuantityG() * scale, order++));
        }
        return order;
    }
    private MealPlanItem createItem(MealPlan plan, Recipe recipe, Food food, double quantity, int order) {
        double q = roundToNearest5(quantity);
        MealPlanItem item = new MealPlanItem();
        item.setMealPlan(plan);
        item.setFood(food);
        item.setMealType(recipe.getMealType());
        item.setRecipeName(recipe.getName());
        item.setRecipeImageUrl(recipe.getIngredients().isEmpty() ? "" : recipe.getIngredients().get(0).getFood().getImageUrl());
        item.setQuantityG(q);
        item.setItemOrder(order);
        item.setCalories(Math.max(1, (int)Math.round(food.getCaloriesPer100g() * q / 100.0)));
        item.setProteinG(round1(food.getProteinPer100g() * q / 100.0));
        item.setCarbsG(round1(food.getCarbsPer100g() * q / 100.0));
        item.setFatG(round1(food.getFatPer100g() * q / 100.0));
        return item;
    }
    private MealPlanDto toDto(MealPlan plan, UserProfile profile) {
        int target = calculateTargetCalories(profile);
        int[] mealTargets = distributeCalories(target);
        Map<String,Integer> targetByMeal = Map.of("reggeli",mealTargets[0],"ebéd",mealTargets[1],"vacsora",mealTargets[2]);
        Map<String,String> labels = Map.of("reggeli","Reggeli","ebéd","Ebéd","vacsora","Vacsora");
        Map<String,List<MealPlanItem>> grouped = new LinkedHashMap<>();
        grouped.put("reggeli",new ArrayList<>());
        grouped.put("ebéd",new ArrayList<>());
        grouped.put("vacsora",new ArrayList<>());
        plan.getItems().stream().sorted(Comparator.comparing(MealPlanItem::getItemOrder)).forEach(i -> grouped.get(i.getMealType()).add(i));
        List<MealPlanDto.MealSectionDto> meals = grouped.entrySet().stream().map(e -> {
            List<MealPlanItem> sec = e.getValue();
            String recipeName = sec.isEmpty() ? "" : sec.get(0).getRecipeName();
            String image = sec.isEmpty() ? "" : sec.get(0).getRecipeImageUrl();
            List<MealPlanDto.MealItemDto> items = sec.stream().map(i -> new MealPlanDto.MealItemDto(i.getId(), i.getFood().getId(), i.getFood().getName(), i.getFood().getCategory(), round0(i.getQuantityG()), i.getCalories(), round1(i.getProteinG()), round1(i.getCarbsG()), round1(i.getFatG()), i.getFood().getImageUrl())).toList();
            int totalCalories = sec.stream().mapToInt(MealPlanItem::getCalories).sum();
            double totalProtein = round1(sec.stream().mapToDouble(MealPlanItem::getProteinG).sum());
            double totalCarbs = round1(sec.stream().mapToDouble(MealPlanItem::getCarbsG).sum());
            double totalFat = round1(sec.stream().mapToDouble(MealPlanItem::getFatG).sum());
            return new MealPlanDto.MealSectionDto(e.getKey(), labels.get(e.getKey()), recipeName, targetByMeal.get(e.getKey()), totalCalories, totalProtein, totalCarbs, totalFat, image, items);
        }).toList();
        return new MealPlanDto(plan.getId(), plan.getUser().getId(), plan.getPlanDate(), target, plan.getTotalCalories(), round1(plan.getTotalProteinG()), round1(plan.getTotalCarbsG()), round1(plan.getTotalFatG()), meals);
    }
    private int totalCalories(Recipe recipe) {
        return recipe.getIngredients().stream().mapToInt(i -> (int)Math.round(i.getFood().getCaloriesPer100g() * i.getQuantityG() / 100.0)).sum();
    }
    private int calculateTargetCalories(UserProfile profile) {
        double weight = profile.getWeightKg() != null ? profile.getWeightKg() : 70.0;
        int height = profile.getHeightCm() != null ? profile.getHeightCm() : 170;
        int age = profile.getAge() != null ? profile.getAge() : 30;
        String gender = profile.getGender() != null ? profile.getGender() : "egyeb";
        String goal = profile.getGoal() != null ? profile.getGoal() : "szintentartas";
        String activity = profile.getActivityLevel() != null ? profile.getActivityLevel() : "kozepes";
        double bmr = "no".equalsIgnoreCase(gender) ? (10 * weight + 6.25 * height - 5 * age - 161) : (10 * weight + 6.25 * height - 5 * age + 5);
        double mult = switch (activity.toLowerCase()) { case "alacsony" -> 1.30; case "magas" -> 1.72; default -> 1.52; };
        int tdee = (int)Math.round(bmr * mult);
        return switch (goal.toLowerCase()) { case "fogyas" -> Math.max(1350, tdee - 400); case "tomegnoveles" -> tdee + 250; default -> tdee; };
    }
    private int[] distributeCalories(int total) { int b = (int)Math.round(total*0.28); int l = (int)Math.round(total*0.40); int d = total-b-l; return new int[]{b,l,d}; }
    private double roundToNearest5(double v) { return Math.max(10.0, Math.round(v/5.0)*5.0); }
    private double round1(double v) { return Math.round(v*10.0)/10.0; }
    private double round0(double v) { return Math.round(v); }
}

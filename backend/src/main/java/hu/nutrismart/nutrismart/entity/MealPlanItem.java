package hu.nutrismart.nutrismart.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "meal_plan_items")
public class MealPlanItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "meal_plan_id")
    private MealPlan mealPlan;
    @ManyToOne(optional = false)
    @JoinColumn(name = "food_id")
    private Food food;
    @Column(nullable = false, length = 30)
    private String mealType;
    @Column(nullable = false, length = 150)
    private String recipeName;
    @Column(length = 255)
    private String recipeImageUrl;
    @Column(nullable = false)
    private Double quantityG;
    private Integer calories;
    private Double proteinG;
    private Double carbsG;
    private Double fatG;
    private Integer itemOrder = 1;
    public MealPlanItem() {}
    public Long getId() { return id; }
    public MealPlan getMealPlan() { return mealPlan; }
    public Food getFood() { return food; }
    public String getMealType() { return mealType; }
    public String getRecipeName() { return recipeName; }
    public String getRecipeImageUrl() { return recipeImageUrl; }
    public Double getQuantityG() { return quantityG; }
    public Integer getCalories() { return calories; }
    public Double getProteinG() { return proteinG; }
    public Double getCarbsG() { return carbsG; }
    public Double getFatG() { return fatG; }
    public Integer getItemOrder() { return itemOrder; }
    public void setId(Long id) { this.id = id; }
    public void setMealPlan(MealPlan mealPlan) { this.mealPlan = mealPlan; }
    public void setFood(Food food) { this.food = food; }
    public void setMealType(String mealType) { this.mealType = mealType; }
    public void setRecipeName(String recipeName) { this.recipeName = recipeName; }
    public void setRecipeImageUrl(String recipeImageUrl) { this.recipeImageUrl = recipeImageUrl; }
    public void setQuantityG(Double quantityG) { this.quantityG = quantityG; }
    public void setCalories(Integer calories) { this.calories = calories; }
    public void setProteinG(Double proteinG) { this.proteinG = proteinG; }
    public void setCarbsG(Double carbsG) { this.carbsG = carbsG; }
    public void setFatG(Double fatG) { this.fatG = fatG; }
    public void setItemOrder(Integer itemOrder) { this.itemOrder = itemOrder; }
}

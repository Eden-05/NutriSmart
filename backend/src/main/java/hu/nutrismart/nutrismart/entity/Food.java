package hu.nutrismart.nutrismart.entity;

import jakarta.persistence.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "foods")
public class Food {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(length = 80)
    private String category;
    @Column(nullable = false, length = 120)
    private String recommendedMeals;
    @Column(nullable = false, length = 20)
    private String macroRole;
    @Column(length = 255)
    private String imageUrl;
    @Column(nullable = false)
    private Integer caloriesPer100g;
    @Column(nullable = false)
    private Double proteinPer100g;
    @Column(nullable = false)
    private Double carbsPer100g;
    @Column(nullable = false)
    private Double fatPer100g;
    private Double fiberPer100g;
    private Double sugarPer100g;
    @Column(nullable = false)
    private Boolean vegetarian = false;
    @Column(nullable = false)
    private Boolean active = true;
    public Food() {}
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getRecommendedMeals() { return recommendedMeals; }
    public String getMacroRole() { return macroRole; }
    public String getImageUrl() { return imageUrl; }
    public Integer getCaloriesPer100g() { return caloriesPer100g; }
    public Double getProteinPer100g() { return proteinPer100g; }
    public Double getCarbsPer100g() { return carbsPer100g; }
    public Double getFatPer100g() { return fatPer100g; }
    public Double getFiberPer100g() { return fiberPer100g; }
    public Double getSugarPer100g() { return sugarPer100g; }
    public Boolean getVegetarian() { return vegetarian; }
    public Boolean getActive() { return active; }
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setCategory(String category) { this.category = category; }
    public void setRecommendedMeals(String recommendedMeals) { this.recommendedMeals = recommendedMeals; }
    public void setMacroRole(String macroRole) { this.macroRole = macroRole; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setCaloriesPer100g(Integer caloriesPer100g) { this.caloriesPer100g = caloriesPer100g; }
    public void setProteinPer100g(Double proteinPer100g) { this.proteinPer100g = proteinPer100g; }
    public void setCarbsPer100g(Double carbsPer100g) { this.carbsPer100g = carbsPer100g; }
    public void setFatPer100g(Double fatPer100g) { this.fatPer100g = fatPer100g; }
    public void setFiberPer100g(Double fiberPer100g) { this.fiberPer100g = fiberPer100g; }
    public void setSugarPer100g(Double sugarPer100g) { this.sugarPer100g = sugarPer100g; }
    public void setVegetarian(Boolean vegetarian) { this.vegetarian = vegetarian; }
    public void setActive(Boolean active) { this.active = active; }
    public List<String> recommendedMealList() {
        if (recommendedMeals == null || recommendedMeals.isBlank()) return List.of();
        return Arrays.stream(recommendedMeals.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());
    }
}

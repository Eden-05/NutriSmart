package hu.nutrismart.nutrismart.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipes")
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(nullable = false, length = 30)
    private String mealType;
    @Column(nullable = false)
    private Boolean vegetarian = false;
    @Column(nullable = false)
    private Boolean active = true;
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("itemOrder ASC")
    private List<RecipeIngredient> ingredients = new ArrayList<>();
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getMealType() { return mealType; }
    public Boolean getVegetarian() { return vegetarian; }
    public Boolean getActive() { return active; }
    public List<RecipeIngredient> getIngredients() { return ingredients; }
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setMealType(String mealType) { this.mealType = mealType; }
    public void setVegetarian(Boolean vegetarian) { this.vegetarian = vegetarian; }
    public void setActive(Boolean active) { this.active = active; }
    public void setIngredients(List<RecipeIngredient> ingredients) { this.ingredients = ingredients; }
}

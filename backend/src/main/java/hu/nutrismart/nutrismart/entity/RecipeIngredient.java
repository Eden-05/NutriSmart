package hu.nutrismart.nutrismart.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "recipe_ingredients")
public class RecipeIngredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;
    @ManyToOne(optional = false)
    @JoinColumn(name = "food_id")
    private Food food;
    @Column(nullable = false)
    private Double quantityG;
    @Column(nullable = false)
    private Integer itemOrder = 1;
    public Long getId() { return id; }
    public Recipe getRecipe() { return recipe; }
    public Food getFood() { return food; }
    public Double getQuantityG() { return quantityG; }
    public Integer getItemOrder() { return itemOrder; }
    public void setId(Long id) { this.id = id; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
    public void setFood(Food food) { this.food = food; }
    public void setQuantityG(Double quantityG) { this.quantityG = quantityG; }
    public void setItemOrder(Integer itemOrder) { this.itemOrder = itemOrder; }
}

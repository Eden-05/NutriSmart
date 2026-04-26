package hu.nutrismart.nutrismart.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "meal_plans",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "planDate"})
)
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDate planDate;

    private Integer totalCalories;
    private Double totalProteinG;
    private Double totalCarbsG;
    private Double totalFatG;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "mealPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealPlanItem> items = new ArrayList<>();

    public MealPlan() {
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public LocalDate getPlanDate() {
        return planDate;
    }

    public Integer getTotalCalories() {
        return totalCalories;
    }

    public Double getTotalProteinG() {
        return totalProteinG;
    }

    public Double getTotalCarbsG() {
        return totalCarbsG;
    }

    public Double getTotalFatG() {
        return totalFatG;
    }

    public String getNotes() {
        return notes;
    }

    public List<MealPlanItem> getItems() {
        return items;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setPlanDate(LocalDate planDate) {
        this.planDate = planDate;
    }

    public void setTotalCalories(Integer totalCalories) {
        this.totalCalories = totalCalories;
    }

    public void setTotalProteinG(Double totalProteinG) {
        this.totalProteinG = totalProteinG;
    }

    public void setTotalCarbsG(Double totalCarbsG) {
        this.totalCarbsG = totalCarbsG;
    }

    public void setTotalFatG(Double totalFatG) {
        this.totalFatG = totalFatG;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setItems(List<MealPlanItem> items) {
        this.items = items;
    }
}

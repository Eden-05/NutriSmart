package hu.nutrismart.nutrismart.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    @Column(length = 120)
    private String fullName;
    @Column(nullable = false, length = 20)
    private String gender;
    private Integer age;
    @Column(nullable = false)
    private Integer heightCm;
    @Column(nullable = false)
    private Double weightKg;
    private Double startingWeightKg;
    private Double currentWeightKg;
    private Double targetWeightKg;
    private Integer waterGoalMl;
    private Integer mealsPerDay;
    private Double sleepGoalHours;
    @Column(nullable = false, length = 30)
    private String goal;
    @Column(nullable = false, length = 30)
    private String activityLevel;
    @Column(nullable = false)
    private Boolean vegetarianEnabled = false;
    public UserProfile() {}
    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getFullName() { return fullName; }
    public String getGender() { return gender; }
    public Integer getAge() { return age; }
    public Integer getHeightCm() { return heightCm; }
    public Double getWeightKg() { return weightKg; }
    public Double getStartingWeightKg() { return startingWeightKg; }
    public Double getCurrentWeightKg() { return currentWeightKg; }
    public Double getTargetWeightKg() { return targetWeightKg; }
    public Integer getWaterGoalMl() { return waterGoalMl; }
    public Integer getMealsPerDay() { return mealsPerDay; }
    public Double getSleepGoalHours() { return sleepGoalHours; }
    public String getGoal() { return goal; }
    public String getActivityLevel() { return activityLevel; }
    public Boolean getVegetarianEnabled() { return vegetarianEnabled; }
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setGender(String gender) { this.gender = gender; }
    public void setAge(Integer age) { this.age = age; }
    public void setHeightCm(Integer heightCm) { this.heightCm = heightCm; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
    public void setStartingWeightKg(Double startingWeightKg) { this.startingWeightKg = startingWeightKg; }
    public void setCurrentWeightKg(Double currentWeightKg) { this.currentWeightKg = currentWeightKg; }
    public void setTargetWeightKg(Double targetWeightKg) { this.targetWeightKg = targetWeightKg; }
    public void setWaterGoalMl(Integer waterGoalMl) { this.waterGoalMl = waterGoalMl; }
    public void setMealsPerDay(Integer mealsPerDay) { this.mealsPerDay = mealsPerDay; }
    public void setSleepGoalHours(Double sleepGoalHours) { this.sleepGoalHours = sleepGoalHours; }
    public void setGoal(String goal) { this.goal = goal; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }
    public void setVegetarianEnabled(Boolean vegetarianEnabled) { this.vegetarianEnabled = vegetarianEnabled; }
}

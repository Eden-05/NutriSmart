package hu.nutrismart.nutrismart.controller;

import hu.nutrismart.nutrismart.dto.MealPlanDto;
import hu.nutrismart.nutrismart.entity.User;
import hu.nutrismart.nutrismart.service.MealPlanService;
import hu.nutrismart.nutrismart.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meal-plans")
public class MealPlanController {

    private final MealPlanService mealPlanService;
    private final UserService userService;

    public MealPlanController(MealPlanService mealPlanService, UserService userService) {
        this.mealPlanService = mealPlanService;
        this.userService = userService;
    }

    @GetMapping("/users/{userId}/today")
    public MealPlanDto getTodayPlan(@PathVariable Long userId, Authentication authentication) {
        ensureSelfOrAdmin(userId, authentication);
        return mealPlanService.getTodayPlan(userId);
    }

    @PostMapping("/users/{userId}/generate")
    public MealPlanDto generatePlan(@PathVariable Long userId, Authentication authentication) {
        ensureSelfOrAdmin(userId, authentication);
        return mealPlanService.generatePlan(userId);
    }

    private void ensureSelfOrAdmin(Long requestedUserId, Authentication authentication) {
        User currentUser = userService.findUserByEmail(authentication.getName());
        boolean admin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (!admin && !currentUser.getId().equals(requestedUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Ehhez a felhasználóhoz nincs hozzáférésed.");
        }
    }
}

package hu.nutrismart.nutrismart.controller;

import hu.nutrismart.nutrismart.dto.FoodDto;
import hu.nutrismart.nutrismart.service.FoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/foods")
public class AdminFoodController {
    private final FoodService foodService;
    public AdminFoodController(FoodService foodService) { this.foodService = foodService; }
    @GetMapping public List<FoodDto> listFoods() { return foodService.getAllFoods(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public FoodDto createFood(@Valid @RequestBody FoodDto body) { return foodService.createFood(body); }
    @PutMapping("/{id}") public FoodDto updateFood(@PathVariable Long id, @Valid @RequestBody FoodDto body) { return foodService.updateFood(id, body); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteFood(@PathVariable Long id) { foodService.deleteFood(id); }
}

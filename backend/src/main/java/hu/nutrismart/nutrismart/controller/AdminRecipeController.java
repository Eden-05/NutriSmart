package hu.nutrismart.nutrismart.controller;

import hu.nutrismart.nutrismart.dto.RecipeDto;
import hu.nutrismart.nutrismart.service.RecipeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/recipes")
public class AdminRecipeController {
    private final RecipeService recipeService;
    public AdminRecipeController(RecipeService recipeService) { this.recipeService = recipeService; }
    @GetMapping public List<RecipeDto> listRecipes() { return recipeService.getAllRecipes(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public RecipeDto createRecipe(@Valid @RequestBody RecipeDto body) { return recipeService.createRecipe(body); }
    @PutMapping("/{id}") public RecipeDto updateRecipe(@PathVariable Long id, @Valid @RequestBody RecipeDto body) { return recipeService.updateRecipe(id, body); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteRecipe(@PathVariable Long id) { recipeService.deleteRecipe(id); }
}

package hu.nutrismart.nutrismart.config;

import hu.nutrismart.nutrismart.dto.FoodDto;
import hu.nutrismart.nutrismart.dto.RecipeDto;
import hu.nutrismart.nutrismart.entity.Role;
import hu.nutrismart.nutrismart.entity.User;
import hu.nutrismart.nutrismart.entity.UserProfile;
import hu.nutrismart.nutrismart.repository.FoodRepository;
import hu.nutrismart.nutrismart.repository.RecipeRepository;
import hu.nutrismart.nutrismart.repository.UserProfileRepository;
import hu.nutrismart.nutrismart.repository.UserRepository;
import hu.nutrismart.nutrismart.service.FoodService;
import hu.nutrismart.nutrismart.service.RecipeService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   UserProfileRepository userProfileRepository,
                                   FoodRepository foodRepository,
                                   RecipeRepository recipeRepository,
                                   RecipeService recipeService,
                                   FoodService foodService,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            User admin = userRepository.findByEmail("admin@nutrismart.hu")
                    .orElseGet(() -> userRepository.save(new User("admin@nutrismart.hu", passwordEncoder.encode("admin12345"), Role.ADMIN)));
            ensureProfile(userProfileRepository, admin, "Admin", "egyeb", 35, 180, 82.0, "szintentartas", "kozepes", false);

            User user = userRepository.findByEmail("user@nutrismart.hu")
                    .orElseGet(() -> userRepository.save(new User("user@nutrismart.hu", passwordEncoder.encode("user12345"), Role.USER)));
            ensureProfile(userProfileRepository, user, "Demo User", "no", 29, 175, 74.0, "fogyas", "kozepes", false);

            seedFoods(foodService, foodRepository);
            seedRecipes(recipeService, recipeRepository, foodRepository);
        };
    }

    private void ensureProfile(UserProfileRepository repository, User user, String fullName, String gender, int age, int heightCm, double weightKg, String goal, String activityLevel, boolean vegetarianEnabled) {
        if (repository.findByUserId(user.getId()).isPresent()) return;
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setFullName(fullName);
        profile.setGender(gender);
        profile.setAge(age);
        profile.setHeightCm(heightCm);
        profile.setWeightKg(weightKg);
        profile.setStartingWeightKg(weightKg);
        profile.setCurrentWeightKg(weightKg);
        profile.setTargetWeightKg(goal.equals("fogyas") ? Math.max(30.0, weightKg - 6.0) : weightKg);
        profile.setWaterGoalMl(2500);
        profile.setMealsPerDay(3);
        profile.setSleepGoalHours(8.0);
        profile.setGoal(goal);
        profile.setActivityLevel(activityLevel);
        profile.setVegetarianEnabled(vegetarianEnabled);
        repository.save(profile);
    }

    private void seedFoods(FoodService foodService, FoodRepository repository) {
        addFood(foodService, repository, "Zabpehely", "gabonák", List.of("reggeli"), "carb", 389, 16.9, 66.3, 6.9, true);
        addFood(foodService, repository, "Skyr", "tejtermék", List.of("reggeli"), "protein", 63, 11.0, 4.0, 0.2, true);
        addFood(foodService, repository, "Görög joghurt", "tejtermék", List.of("reggeli"), "protein", 97, 9.0, 3.9, 5.0, true);
        addFood(foodService, repository, "Banán", "gyümölcs", List.of("reggeli"), "carb", 89, 1.1, 22.8, 0.3, true);
        addFood(foodService, repository, "Áfonya", "gyümölcs", List.of("reggeli"), "carb", 57, 0.7, 14.5, 0.3, true);
        addFood(foodService, repository, "Eper", "gyümölcs", List.of("reggeli"), "carb", 32, 0.7, 7.7, 0.3, true);
        addFood(foodService, repository, "Alma", "gyümölcs", List.of("reggeli", "vacsora"), "carb", 52, 0.3, 13.8, 0.2, true);
        addFood(foodService, repository, "Körte", "gyümölcs", List.of("reggeli", "vacsora"), "carb", 57, 0.4, 15.2, 0.1, true);
        addFood(foodService, repository, "Mogyoróvaj", "krém", List.of("reggeli"), "fat", 588, 25.0, 20.0, 50.0, true);
        addFood(foodService, repository, "Chia mag", "mag", List.of("reggeli"), "fat", 486, 17.0, 42.0, 31.0, true);
        addFood(foodService, repository, "Mandula", "olajos mag", List.of("reggeli"), "fat", 579, 21.0, 22.0, 50.0, true);
        addFood(foodService, repository, "Dió", "olajos mag", List.of("reggeli", "vacsora"), "fat", 654, 15.2, 13.7, 65.2, true);
        addFood(foodService, repository, "Tojás", "fehérjeforrás", List.of("reggeli"), "protein", 155, 13.0, 1.1, 11.0, true);
        addFood(foodService, repository, "Teljes kiőrlésű kenyér", "pékáru", List.of("reggeli", "vacsora"), "carb", 247, 13.0, 41.0, 4.2, true);
        addFood(foodService, repository, "Avokádó", "gyümölcs", List.of("reggeli"), "fat", 160, 2.0, 8.5, 14.7, true);
        addFood(foodService, repository, "Csirkemell", "hús", List.of("ebéd", "vacsora"), "protein", 120, 22.5, 0.0, 2.6, false);
        addFood(foodService, repository, "Pulykamell", "hús", List.of("ebéd", "vacsora"), "protein", 114, 24.0, 0.0, 1.2, false);
        addFood(foodService, repository, "Lazac", "hal", List.of("ebéd", "vacsora"), "protein", 208, 20.0, 0.0, 13.0, false);
        addFood(foodService, repository, "Tonhal", "hal", List.of("ebéd", "vacsora"), "protein", 132, 29.0, 0.0, 1.0, false);
        addFood(foodService, repository, "Tofu", "növényi fehérje", List.of("ebéd", "vacsora"), "protein", 144, 17.0, 3.0, 9.0, true);
        addFood(foodService, repository, "Csicseriborsó", "hüvelyes", List.of("ebéd", "vacsora"), "protein", 164, 9.0, 27.0, 2.6, true);
        addFood(foodService, repository, "Vöröslencse", "hüvelyes", List.of("ebéd"), "protein", 116, 9.0, 20.0, 0.4, true);
        addFood(foodService, repository, "Barna rizs", "köret", List.of("ebéd"), "carb", 123, 2.7, 25.6, 1.0, true);
        addFood(foodService, repository, "Quinoa", "köret", List.of("ebéd"), "carb", 120, 4.4, 21.3, 1.9, true);
        addFood(foodService, repository, "Bulgur", "köret", List.of("ebéd"), "carb", 83, 3.1, 18.6, 0.2, true);
        addFood(foodService, repository, "Kuszkusz", "köret", List.of("ebéd"), "carb", 112, 3.8, 23.2, 0.2, true);
        addFood(foodService, repository, "Burgonya", "köret", List.of("ebéd", "vacsora"), "carb", 77, 2.0, 17.0, 0.1, true);
        addFood(foodService, repository, "Édesburgonya", "köret", List.of("ebéd", "vacsora"), "carb", 86, 1.6, 20.1, 0.1, true);
        addFood(foodService, repository, "Brokkoli", "zöldség", List.of("ebéd", "vacsora"), "carb", 34, 2.8, 7.0, 0.4, true);
        addFood(foodService, repository, "Cukkini", "zöldség", List.of("ebéd", "vacsora"), "carb", 17, 1.2, 3.1, 0.3, true);
        addFood(foodService, repository, "Spenót", "zöldség", List.of("ebéd", "vacsora"), "carb", 23, 2.9, 3.6, 0.4, true);
        addFood(foodService, repository, "Paradicsom", "zöldség", List.of("reggeli", "ebéd", "vacsora"), "carb", 18, 0.9, 3.9, 0.2, true);
        addFood(foodService, repository, "Uborka", "zöldség", List.of("ebéd", "vacsora"), "carb", 15, 0.7, 3.6, 0.1, true);
        addFood(foodService, repository, "Paprika", "zöldség", List.of("vacsora", "ebéd"), "carb", 31, 1.0, 6.0, 0.3, true);
        addFood(foodService, repository, "Olívaolaj", "zsírok", List.of("ebéd", "vacsora"), "fat", 884, 0.0, 0.0, 100.0, true);
        addFood(foodService, repository, "Feta", "sajt", List.of("ebéd", "vacsora"), "fat", 264, 14.0, 4.0, 21.0, true);
        addFood(foodService, repository, "Tahini", "krém", List.of("ebéd"), "fat", 595, 17.0, 21.0, 54.0, true);
        addFood(foodService, repository, "Humusz", "krém", List.of("vacsora", "ebéd"), "fat", 166, 8.0, 14.0, 9.6, true);
        addFood(foodService, repository, "Túró", "tejtermék", List.of("vacsora", "reggeli"), "protein", 98, 11.0, 3.4, 4.3, true);
        addFood(foodService, repository, "Mozzarella light", "tejtermék", List.of("vacsora"), "protein", 158, 22.0, 2.0, 7.0, true);
        addFood(foodService, repository, "Teljes kiőrlésű tortilla", "pékáru", List.of("vacsora"), "carb", 310, 9.0, 52.0, 7.0, true);
        addFood(foodService, repository, "Rozskenyér", "pékáru", List.of("vacsora"), "carb", 259, 8.5, 48.0, 3.3, true);
        addFood(foodService, repository, "Olívabogyó", "zsírok", List.of("vacsora"), "fat", 115, 0.8, 6.3, 10.7, true);
        addFood(foodService, repository, "Krémsajt light", "tejtermék", List.of("vacsora"), "fat", 217, 8.0, 6.0, 19.0, true);
        addFood(foodService, repository, "Zabital", "ital", List.of("reggeli"), "carb", 45, 1.0, 6.7, 1.5, true);
        addFood(foodService, repository, "Proteinpor", "kiegészítő", List.of("reggeli"), "protein", 390, 75.0, 8.0, 6.0, true);
        addFood(foodService, repository, "Kefir", "tejtermék", List.of("reggeli", "vacsora"), "protein", 52, 3.4, 4.8, 2.0, true);
        addFood(foodService, repository, "Ricotta light", "tejtermék", List.of("reggeli", "vacsora"), "protein", 138, 11.4, 5.1, 7.9, true);
        addFood(foodService, repository, "Füstölt lazac", "hal", List.of("reggeli", "vacsora"), "protein", 117, 18.3, 0.0, 4.3, false);
        addFood(foodService, repository, "Garnéla", "tenger gyümölcsei", List.of("ebéd", "vacsora"), "protein", 99, 24.0, 0.2, 0.3, false);
        addFood(foodService, repository, "Marhahús sovány", "hús", List.of("ebéd", "vacsora"), "protein", 158, 26.0, 0.0, 6.0, false);
        addFood(foodService, repository, "Sertéskaraj", "hús", List.of("ebéd", "vacsora"), "protein", 143, 21.0, 0.0, 5.0, false);
        addFood(foodService, repository, "Teljes kiőrlésű tészta", "köret", List.of("ebéd", "vacsora"), "carb", 150, 5.8, 30.0, 1.1, true);
        addFood(foodService, repository, "Hajdina", "köret", List.of("ebéd", "vacsora"), "carb", 92, 3.4, 19.9, 0.6, true);
        addFood(foodService, repository, "Kukorica", "zöldség", List.of("ebéd", "vacsora"), "carb", 96, 3.4, 21.0, 1.5, true);
        addFood(foodService, repository, "Sárgarépa", "zöldség", List.of("ebéd", "vacsora"), "carb", 41, 0.9, 9.6, 0.2, true);
        addFood(foodService, repository, "Zöldborsó", "zöldség", List.of("ebéd", "vacsora"), "carb", 81, 5.4, 14.5, 0.4, true);
        addFood(foodService, repository, "Vöröshagyma", "zöldség", List.of("ebéd", "vacsora"), "carb", 40, 1.1, 9.3, 0.1, true);
        addFood(foodService, repository, "Gomba", "zöldség", List.of("reggeli", "ebéd", "vacsora"), "carb", 22, 3.1, 3.3, 0.3, true);
        addFood(foodService, repository, "Rukkola", "zöldség", List.of("reggeli", "ebéd", "vacsora"), "carb", 25, 2.6, 3.7, 0.7, true);
        addFood(foodService, repository, "Lenmag", "mag", List.of("reggeli"), "fat", 534, 18.3, 28.9, 42.2, true);
    }

    private void seedRecipes(RecipeService recipeService, RecipeRepository recipeRepository, FoodRepository foodRepository) {
        createRecipe(recipeService, recipeRepository, foodRepository, "Skyr zabkása áfonyával", "reggeli", true, ingredient(foodRepository, "Zabpehely", 65), ingredient(foodRepository, "Skyr", 200), ingredient(foodRepository, "Áfonya", 100), ingredient(foodRepository, "Mandula", 15));
        createRecipe(recipeService, recipeRepository, foodRepository, "Tojásos avokádós pirítós", "reggeli", true, ingredient(foodRepository, "Tojás", 120), ingredient(foodRepository, "Teljes kiőrlésű kenyér", 90), ingredient(foodRepository, "Avokádó", 70), ingredient(foodRepository, "Paradicsom", 80));
        createRecipe(recipeService, recipeRepository, foodRepository, "Joghurtos chia tál eperrel", "reggeli", true, ingredient(foodRepository, "Görög joghurt", 180), ingredient(foodRepository, "Chia mag", 20), ingredient(foodRepository, "Eper", 140), ingredient(foodRepository, "Banán", 90));
        createRecipe(recipeService, recipeRepository, foodRepository, "Túrós-almás reggeli tál", "reggeli", true, ingredient(foodRepository, "Túró", 180), ingredient(foodRepository, "Alma", 140), ingredient(foodRepository, "Zabpehely", 45), ingredient(foodRepository, "Dió", 15));
        createRecipe(recipeService, recipeRepository, foodRepository, "Protein smoothie bowl", "reggeli", true, ingredient(foodRepository, "Zabital", 250), ingredient(foodRepository, "Proteinpor", 30), ingredient(foodRepository, "Banán", 100), ingredient(foodRepository, "Áfonya", 80), ingredient(foodRepository, "Chia mag", 12));
        createRecipe(recipeService, recipeRepository, foodRepository, "Skyr-körte pohárkrém", "reggeli", true, ingredient(foodRepository, "Skyr", 200), ingredient(foodRepository, "Körte", 140), ingredient(foodRepository, "Zabpehely", 40), ingredient(foodRepository, "Mandula", 12));

        createRecipe(recipeService, recipeRepository, foodRepository, "Csirkemell barna rizzsel és brokkolival", "ebéd", false, ingredient(foodRepository, "Csirkemell", 170), ingredient(foodRepository, "Barna rizs", 220), ingredient(foodRepository, "Brokkoli", 150), ingredient(foodRepository, "Olívaolaj", 10));
        createRecipe(recipeService, recipeRepository, foodRepository, "Lazac quinoa salátával", "ebéd", false, ingredient(foodRepository, "Lazac", 160), ingredient(foodRepository, "Quinoa", 180), ingredient(foodRepository, "Uborka", 120), ingredient(foodRepository, "Paradicsom", 120), ingredient(foodRepository, "Olívaolaj", 10));
        createRecipe(recipeService, recipeRepository, foodRepository, "Tofus bulgur tál", "ebéd", true, ingredient(foodRepository, "Tofu", 180), ingredient(foodRepository, "Bulgur", 220), ingredient(foodRepository, "Brokkoli", 140), ingredient(foodRepository, "Tahini", 15));
        createRecipe(recipeService, recipeRepository, foodRepository, "Lencsés édesburgonya tál", "ebéd", true, ingredient(foodRepository, "Vöröslencse", 220), ingredient(foodRepository, "Édesburgonya", 220), ingredient(foodRepository, "Paradicsom", 100), ingredient(foodRepository, "Feta", 35));
        createRecipe(recipeService, recipeRepository, foodRepository, "Pulykamell kuszkusszal", "ebéd", false, ingredient(foodRepository, "Pulykamell", 170), ingredient(foodRepository, "Kuszkusz", 220), ingredient(foodRepository, "Cukkini", 160), ingredient(foodRepository, "Olívaolaj", 10));
        createRecipe(recipeService, recipeRepository, foodRepository, "Csicseriborsós quinoa saláta", "ebéd", true, ingredient(foodRepository, "Csicseriborsó", 180), ingredient(foodRepository, "Quinoa", 170), ingredient(foodRepository, "Uborka", 120), ingredient(foodRepository, "Paradicsom", 120), ingredient(foodRepository, "Feta", 30));
        createRecipe(recipeService, recipeRepository, foodRepository, "Tonhalas rizstál", "ebéd", false, ingredient(foodRepository, "Tonhal", 140), ingredient(foodRepository, "Barna rizs", 210), ingredient(foodRepository, "Csicseriborsó", 120), ingredient(foodRepository, "Uborka", 80));
        createRecipe(recipeService, recipeRepository, foodRepository, "Spenótos tofu kuszkusszal", "ebéd", true, ingredient(foodRepository, "Tofu", 170), ingredient(foodRepository, "Kuszkusz", 210), ingredient(foodRepository, "Spenót", 120), ingredient(foodRepository, "Olívaolaj", 8));

        createRecipe(recipeService, recipeRepository, foodRepository, "Tonhalas tortilla paprikával", "vacsora", false, ingredient(foodRepository, "Tonhal", 120), ingredient(foodRepository, "Teljes kiőrlésű tortilla", 70), ingredient(foodRepository, "Paprika", 100), ingredient(foodRepository, "Krémsajt light", 35));
        createRecipe(recipeService, recipeRepository, foodRepository, "Túrós szendvics zöldségekkel", "vacsora", true, ingredient(foodRepository, "Túró", 180), ingredient(foodRepository, "Rozskenyér", 90), ingredient(foodRepository, "Paradicsom", 120), ingredient(foodRepository, "Uborka", 120));
        createRecipe(recipeService, recipeRepository, foodRepository, "Mozzarellás wrap humusszal", "vacsora", true, ingredient(foodRepository, "Mozzarella light", 100), ingredient(foodRepository, "Teljes kiőrlésű tortilla", 70), ingredient(foodRepository, "Humusz", 40), ingredient(foodRepository, "Paprika", 100));
        createRecipe(recipeService, recipeRepository, foodRepository, "Sült burgonya túrókrémmel", "vacsora", true, ingredient(foodRepository, "Burgonya", 250), ingredient(foodRepository, "Túró", 160), ingredient(foodRepository, "Paprika", 80), ingredient(foodRepository, "Olívaolaj", 5));
        createRecipe(recipeService, recipeRepository, foodRepository, "Lazacos saláta fetával", "vacsora", false, ingredient(foodRepository, "Lazac", 140), ingredient(foodRepository, "Spenót", 120), ingredient(foodRepository, "Paradicsom", 120), ingredient(foodRepository, "Uborka", 100), ingredient(foodRepository, "Feta", 30));
        createRecipe(recipeService, recipeRepository, foodRepository, "Tofus tortilla humusszal", "vacsora", true, ingredient(foodRepository, "Tofu", 160), ingredient(foodRepository, "Teljes kiőrlésű tortilla", 70), ingredient(foodRepository, "Humusz", 35), ingredient(foodRepository, "Paprika", 100));
        createRecipe(recipeService, recipeRepository, foodRepository, "Pulykás rozskenyér szendvics", "vacsora", false, ingredient(foodRepository, "Pulykamell", 130), ingredient(foodRepository, "Rozskenyér", 100), ingredient(foodRepository, "Paradicsom", 90), ingredient(foodRepository, "Uborka", 90), ingredient(foodRepository, "Krémsajt light", 20));
        createRecipe(recipeService, recipeRepository, foodRepository, "Csicseriborsós feta saláta", "vacsora", true, ingredient(foodRepository, "Csicseriborsó", 180), ingredient(foodRepository, "Uborka", 120), ingredient(foodRepository, "Paradicsom", 120), ingredient(foodRepository, "Feta", 35), ingredient(foodRepository, "Olívabogyó", 25));
        createRecipe(recipeService, recipeRepository, foodRepository, "Citromos csirkés rizstál", "ebéd", false, ingredient(foodRepository, "Csirkemell", 170), ingredient(foodRepository, "Barna rizs", 200), ingredient(foodRepository, "Paprika", 120), ingredient(foodRepository, "Paradicsom", 120), ingredient(foodRepository, "Olívaolaj", 10));
        createRecipe(recipeService, recipeRepository, foodRepository, "Pulykamell sült burgonyával és brokkolival", "ebéd", false, ingredient(foodRepository, "Pulykamell", 180), ingredient(foodRepository, "Burgonya", 260), ingredient(foodRepository, "Brokkoli", 150), ingredient(foodRepository, "Olívaolaj", 12));
        createRecipe(recipeService, recipeRepository, foodRepository, "Lazacos bulgur serpenyő", "ebéd", false, ingredient(foodRepository, "Lazac", 150), ingredient(foodRepository, "Bulgur", 220), ingredient(foodRepository, "Cukkini", 160), ingredient(foodRepository, "Olívaolaj", 10));
        createRecipe(recipeService, recipeRepository, foodRepository, "Tonhalas quinoa saláta", "ebéd", false, ingredient(foodRepository, "Tonhal", 150), ingredient(foodRepository, "Quinoa", 200), ingredient(foodRepository, "Paradicsom", 120), ingredient(foodRepository, "Uborka", 120), ingredient(foodRepository, "Olívaolaj", 8));
        createRecipe(recipeService, recipeRepository, foodRepository, "Csirkés édesburgonya spenót tál", "ebéd", false, ingredient(foodRepository, "Csirkemell", 160), ingredient(foodRepository, "Édesburgonya", 230), ingredient(foodRepository, "Spenót", 140), ingredient(foodRepository, "Feta", 25), ingredient(foodRepository, "Olívaolaj", 6));
        createRecipe(recipeService, recipeRepository, foodRepository, "Tahinis tofu quinoa bowl", "ebéd", true, ingredient(foodRepository, "Tofu", 180), ingredient(foodRepository, "Quinoa", 200), ingredient(foodRepository, "Brokkoli", 160), ingredient(foodRepository, "Tahini", 18));
        createRecipe(recipeService, recipeRepository, foodRepository, "Vöröslencsés rizstál spenóttal", "ebéd", true, ingredient(foodRepository, "Vöröslencse", 240), ingredient(foodRepository, "Barna rizs", 180), ingredient(foodRepository, "Spenót", 140), ingredient(foodRepository, "Olívaolaj", 12));
        createRecipe(recipeService, recipeRepository, foodRepository, "Csicseris bulgur bowl tahinivel", "ebéd", true, ingredient(foodRepository, "Csicseriborsó", 190), ingredient(foodRepository, "Bulgur", 220), ingredient(foodRepository, "Paprika", 120), ingredient(foodRepository, "Tahini", 20));
        createRecipe(recipeService, recipeRepository, foodRepository, "Tofus édesburgonya cukkini tál", "ebéd", true, ingredient(foodRepository, "Tofu", 170), ingredient(foodRepository, "Édesburgonya", 240), ingredient(foodRepository, "Cukkini", 180), ingredient(foodRepository, "Olívaolaj", 10));
        createRecipe(recipeService, recipeRepository, foodRepository, "Csicseriborsós quinoa uborkasaláta", "ebéd", true, ingredient(foodRepository, "Csicseriborsó", 180), ingredient(foodRepository, "Quinoa", 180), ingredient(foodRepository, "Uborka", 140), ingredient(foodRepository, "Paradicsom", 130), ingredient(foodRepository, "Olívaolaj", 8));
        createRecipe(recipeService, recipeRepository, foodRepository, "Csirkés tortilla humusszal", "vacsora", false, ingredient(foodRepository, "Csirkemell", 130), ingredient(foodRepository, "Teljes kiőrlésű tortilla", 80), ingredient(foodRepository, "Humusz", 35), ingredient(foodRepository, "Paradicsom", 110), ingredient(foodRepository, "Paprika", 90));
        createRecipe(recipeService, recipeRepository, foodRepository, "Pulykás rozskenyér krémsajttal", "vacsora", false, ingredient(foodRepository, "Pulykamell", 140), ingredient(foodRepository, "Rozskenyér", 110), ingredient(foodRepository, "Krémsajt light", 35), ingredient(foodRepository, "Uborka", 110));
        createRecipe(recipeService, recipeRepository, foodRepository, "Lazacos tortilla spenóttal", "vacsora", false, ingredient(foodRepository, "Lazac", 130), ingredient(foodRepository, "Teljes kiőrlésű tortilla", 75), ingredient(foodRepository, "Uborka", 110), ingredient(foodRepository, "Spenót", 100));
        createRecipe(recipeService, recipeRepository, foodRepository, "Tonhalas burgonyasaláta", "vacsora", false, ingredient(foodRepository, "Tonhal", 120), ingredient(foodRepository, "Burgonya", 240), ingredient(foodRepository, "Paradicsom", 120), ingredient(foodRepository, "Olívaolaj", 6));
        createRecipe(recipeService, recipeRepository, foodRepository, "Csirkés burgonya-humusz tányér", "vacsora", false, ingredient(foodRepository, "Csirkemell", 150), ingredient(foodRepository, "Burgonya", 220), ingredient(foodRepository, "Paprika", 100), ingredient(foodRepository, "Humusz", 30));
        createRecipe(recipeService, recipeRepository, foodRepository, "Tofus avokádós szendvics", "vacsora", true, ingredient(foodRepository, "Tofu", 160), ingredient(foodRepository, "Rozskenyér", 80), ingredient(foodRepository, "Avokádó", 60), ingredient(foodRepository, "Paradicsom", 100));
        createRecipe(recipeService, recipeRepository, foodRepository, "Csicseris tortilla paprikával", "vacsora", true, ingredient(foodRepository, "Csicseriborsó", 170), ingredient(foodRepository, "Teljes kiőrlésű tortilla", 60), ingredient(foodRepository, "Humusz", 30), ingredient(foodRepository, "Paprika", 110));
        createRecipe(recipeService, recipeRepository, foodRepository, "Mediterrán túrós burgonyatál", "vacsora", true, ingredient(foodRepository, "Túró", 180), ingredient(foodRepository, "Burgonya", 230), ingredient(foodRepository, "Paradicsom", 120), ingredient(foodRepository, "Olívaolaj", 6));
        createRecipe(recipeService, recipeRepository, foodRepository, "Mozzarellás rozskenyér olívával", "vacsora", true, ingredient(foodRepository, "Mozzarella light", 95), ingredient(foodRepository, "Rozskenyér", 100), ingredient(foodRepository, "Paradicsom", 130), ingredient(foodRepository, "Olívabogyó", 25));
        createRecipe(recipeService, recipeRepository, foodRepository, "Lencsés burgonyasaláta fetával", "vacsora", true, ingredient(foodRepository, "Vöröslencse", 180), ingredient(foodRepository, "Burgonya", 220), ingredient(foodRepository, "Uborka", 120), ingredient(foodRepository, "Feta", 25), ingredient(foodRepository, "Olívaolaj", 5));
        createRecipe(recipeService, recipeRepository, foodRepository, "Kefires zabkása lenmaggal", "reggeli", true, ingredient(foodRepository, "Zabpehely", 60), ingredient(foodRepository, "Kefir", 220), ingredient(foodRepository, "Banán", 90), ingredient(foodRepository, "Lenmag", 12));
        createRecipe(recipeService, recipeRepository, foodRepository, "Gombás tojásos rozsos reggeli", "reggeli", true, ingredient(foodRepository, "Tojás", 120), ingredient(foodRepository, "Gomba", 120), ingredient(foodRepository, "Rozskenyér", 80), ingredient(foodRepository, "Rukkola", 40));
        createRecipe(recipeService, recipeRepository, foodRepository, "Ricottás körtekrém dióval", "reggeli", true, ingredient(foodRepository, "Ricotta light", 180), ingredient(foodRepository, "Körte", 150), ingredient(foodRepository, "Dió", 15), ingredient(foodRepository, "Chia mag", 10));
        createRecipe(recipeService, recipeRepository, foodRepository, "Garnélás teljes kiőrlésű tészta", "ebéd", false, ingredient(foodRepository, "Garnéla", 170), ingredient(foodRepository, "Teljes kiőrlésű tészta", 230), ingredient(foodRepository, "Cukkini", 140), ingredient(foodRepository, "Olívaolaj", 8));
        createRecipe(recipeService, recipeRepository, foodRepository, "Sovány marhahús hajdinával", "ebéd", false, ingredient(foodRepository, "Marhahús sovány", 170), ingredient(foodRepository, "Hajdina", 220), ingredient(foodRepository, "Sárgarépa", 120), ingredient(foodRepository, "Vöröshagyma", 50));
        createRecipe(recipeService, recipeRepository, foodRepository, "Sertéskaraj zöldborsós bulgurral", "ebéd", false, ingredient(foodRepository, "Sertéskaraj", 170), ingredient(foodRepository, "Bulgur", 210), ingredient(foodRepository, "Zöldborsó", 120), ingredient(foodRepository, "Olívaolaj", 8));
        createRecipe(recipeService, recipeRepository, foodRepository, "Zöldborsós tofu hajdina bowl", "ebéd", true, ingredient(foodRepository, "Tofu", 170), ingredient(foodRepository, "Hajdina", 210), ingredient(foodRepository, "Zöldborsó", 130), ingredient(foodRepository, "Sárgarépa", 100));
        createRecipe(recipeService, recipeRepository, foodRepository, "Füstölt lazacos rukkolás szendvics", "vacsora", false, ingredient(foodRepository, "Füstölt lazac", 100), ingredient(foodRepository, "Rozskenyér", 90), ingredient(foodRepository, "Rukkola", 50), ingredient(foodRepository, "Krémsajt light", 30));
        createRecipe(recipeService, recipeRepository, foodRepository, "Kukoricás tonhalas tésztasaláta", "vacsora", false, ingredient(foodRepository, "Tonhal", 120), ingredient(foodRepository, "Teljes kiőrlésű tészta", 180), ingredient(foodRepository, "Kukorica", 90), ingredient(foodRepository, "Uborka", 100));
        createRecipe(recipeService, recipeRepository, foodRepository, "Gombás ricottás tortilla", "vacsora", true, ingredient(foodRepository, "Teljes kiőrlésű tortilla", 70), ingredient(foodRepository, "Gomba", 140), ingredient(foodRepository, "Ricotta light", 100), ingredient(foodRepository, "Rukkola", 45));
    }

    private void addFood(FoodService foodService, FoodRepository repository, String name, String category, List<String> meals, String role, int kcal, double protein, double carbs, double fat, boolean vegetarian) {
        FoodDto dto = new FoodDto(null, name, category, meals, role, "", kcal, protein, carbs, fat, vegetarian, true);
        repository.findByNameIgnoreCase(name).ifPresentOrElse(
                existing -> foodService.updateFood(existing.getId(), dto),
                () -> foodService.createFood(dto)
        );
    }

    private void createRecipe(RecipeService recipeService, RecipeRepository recipeRepository, FoodRepository foodRepository, String name, String mealType, boolean vegetarian, RecipeDto.RecipeIngredientDto... ingredients) {
        RecipeDto dto = new RecipeDto(null, name, mealType, vegetarian, true, null, null, null, null, null, List.of(ingredients));
        recipeRepository.findByNameIgnoreCase(name).ifPresentOrElse(
                existing -> recipeService.updateRecipe(existing.getId(), dto),
                () -> recipeService.createRecipe(dto)
        );
    }

    private RecipeDto.RecipeIngredientDto ingredient(FoodRepository foodRepository, String foodName, double quantityG) {
        Long foodId = foodRepository.findByNameIgnoreCase(foodName).orElseThrow().getId();
        return new RecipeDto.RecipeIngredientDto(null, foodId, foodName, quantityG, null, null, null, null, null);
    }
}

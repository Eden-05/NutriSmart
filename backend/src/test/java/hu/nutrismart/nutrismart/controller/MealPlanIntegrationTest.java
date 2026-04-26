package hu.nutrismart.nutrismart.controller;

import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class MealPlanIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private JsonNode login(String email, String password) throws Exception {
        String payload = "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
        return objectMapper.readTree(mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(payload)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }

    @Test
    void generatedMealPlanContainsOneRecipePerMealWithRealisticQuantities() throws Exception {
        JsonNode login = login("user@nutrismart.hu", "user12345");
        String token = login.get("token").asText();
        long userId = login.get("user").get("id").asLong();

        JsonNode plan = objectMapper.readTree(mockMvc.perform(post("/api/meal-plans/users/{id}/generate", userId).header("Authorization", "Bearer " + token)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        assertThat(plan.get("meals")).hasSize(3);
        for (JsonNode meal : plan.get("meals")) {
            assertThat(meal.get("recipeName").asText()).isNotBlank();
            assertThat(meal.get("items").size()).isGreaterThanOrEqualTo(3);
            for (JsonNode item : meal.get("items")) {
                assertThat(item.get("quantityG").asDouble()).isBetween(10.0, 400.0);
            }
        }
    }

    @Test
    void repeatedGenerateRequestDoesNotFailWithServerError() throws Exception {
        JsonNode login = login("user@nutrismart.hu", "user12345");
        String token = login.get("token").asText();
        long userId = login.get("user").get("id").asLong();

        mockMvc.perform(post("/api/meal-plans/users/{id}/generate", userId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        JsonNode secondPlan = objectMapper.readTree(mockMvc.perform(post("/api/meal-plans/users/{id}/generate", userId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());

        assertThat(secondPlan.get("userId").asLong()).isEqualTo(userId);
        assertThat(secondPlan.get("meals")).hasSize(3);
    }

    @Test
    void vegetarianProfileGeneratesVegetarianPlan() throws Exception {
        JsonNode login = login("user@nutrismart.hu", "user12345");
        String token = login.get("token").asText();
        long userId = login.get("user").get("id").asLong();
        String body = "{\"id\":2,\"email\":\"user@nutrismart.hu\",\"fullName\":\"Demo User\",\"gender\":\"no\",\"age\":29,\"heightCm\":175,\"weightKg\":74,\"goal\":\"fogyas\",\"activityLevel\":\"kozepes\",\"vegetarianEnabled\":true}";

        mockMvc.perform(put("/api/users/{id}", userId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vegetarianEnabled").value(true));

        JsonNode plan = objectMapper.readTree(mockMvc.perform(post("/api/meal-plans/users/{id}/generate", userId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());

        String serialized = plan.toString().toLowerCase();
        assertThat(serialized).doesNotContain("csirkemell").doesNotContain("lazac").doesNotContain("tonhal");
    }
}

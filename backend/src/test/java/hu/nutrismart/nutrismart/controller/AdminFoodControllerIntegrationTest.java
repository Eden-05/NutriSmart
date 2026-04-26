package hu.nutrismart.nutrismart.controller;

import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AdminFoodControllerIntegrationTest {
    @Autowired MockMvc mockMvc; @Autowired ObjectMapper objectMapper;
    @Test void adminCanCreateAndUpdateFood() throws Exception {
        String loginPayload = "{\"email\":\"admin@nutrismart.hu\",\"password\":\"admin12345\"}";
        JsonNode login = objectMapper.readTree(mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(loginPayload)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        String token = login.get("token").asText();
        String create = "{\"name\":\"Sült karfiol\",\"category\":\"zöldség\",\"recommendedMeals\":[\"ebéd\"],\"macroRole\":\"carb\",\"imageUrl\":\"\",\"caloriesPer100g\":60,\"proteinPer100g\":2.5,\"carbsPer100g\":8.0,\"fatPer100g\":2.0,\"vegetarian\":true,\"active\":true}";
        String created = mockMvc.perform(post("/api/admin/foods").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(create)).andExpect(status().isCreated()).andExpect(jsonPath("$.name").value("Sült karfiol")).andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(created).get("id").asLong();
        String update = "{\"name\":\"Sült karfiol citrommal\",\"category\":\"zöldség\",\"recommendedMeals\":[\"ebéd\"],\"macroRole\":\"carb\",\"imageUrl\":\"\",\"caloriesPer100g\":62,\"proteinPer100g\":2.5,\"carbsPer100g\":8.5,\"fatPer100g\":2.0,\"vegetarian\":true,\"active\":true}";
        mockMvc.perform(put("/api/admin/foods/{id}", id).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(update)).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Sült karfiol citrommal"));
    }
}

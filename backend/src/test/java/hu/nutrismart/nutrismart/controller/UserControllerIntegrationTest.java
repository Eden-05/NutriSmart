package hu.nutrismart.nutrismart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken() throws Exception {
        String loginPayload = """
                {
                  "email": "user@nutrismart.hu",
                  "password": "user12345"
                }
                """;

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("token").asText();
    }

    @Test
    void currentUserContainsFullName() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + userToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@nutrismart.hu"))
                .andExpect(jsonPath("$.fullName").value("Demo User"));
    }

    @Test
    void userCanUpdateOwnProfile() throws Exception {
        mockMvc.perform(put("/api/users/2")
                        .header("Authorization", "Bearer " + userToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": 2,
                                  "email": "user@nutrismart.hu",
                                  "fullName": "Demo User Updated",
                                  "gender": "no",
                                  "age": 30,
                                  "heightCm": 176,
                                  "weightKg": 72.5,
                                  "goal": "szintentartas",
                                  "activityLevel": "magas"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Demo User Updated"))
                .andExpect(jsonPath("$.activityLevel").value("magas"));
    }

    @Test
    void userCannotAccessAnotherUsersProfile() throws Exception {
        mockMvc.perform(get("/api/users/1")
                        .header("Authorization", "Bearer " + userToken()))
                .andExpect(status().isForbidden());
    }
}

package hu.nutrismart.nutrismart.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken() throws Exception {
        String loginPayload = """
                {
                  "email": "admin@nutrismart.hu",
                  "password": "admin12345"
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
    void adminListContainsFullName() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").isNotEmpty());
    }

    @Test
    void adminCannotDisableOrDemoteSelf() throws Exception {
        String token = adminToken();
        String meResponse = mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        long adminId = objectMapper.readTree(meResponse).get("id").asLong();

        mockMvc.perform(patch("/api/admin/users/{id}", adminId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "USER",
                                  "active": false
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Az admin nem veheti el a saját admin jogosultságát."));
    }

    @Test
    void adminCannotDeleteSelf() throws Exception {
        String token = adminToken();
        String meResponse = mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        long adminId = objectMapper.readTree(meResponse).get("id").asLong();

        mockMvc.perform(delete("/api/admin/users/{id}", adminId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Az admin nem törölheti önmagát."));
    }

    @Test
    void adminCanDeleteAnotherUser() throws Exception {
        String token = adminToken();

        String registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "torlendo@nutrismart.hu",
                                  "password": "StrongPass1",
                                  "confirmPassword": "StrongPass1",
                                  "fullName": "Törlendő Béla"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode registeredUser = objectMapper.readTree(registerResponse).get("user");
        long userId = registeredUser.get("id").asLong();

        mockMvc.perform(delete("/api/admin/users/{id}", userId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        String usersResponse = mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(usersResponse).doesNotContain("torlendo@nutrismart.hu");
    }
}

package com.example.vanish;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SecretControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createThenReadThenGone() throws Exception {
        String body = mockMvc.perform(post("/api/secrets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"This is my secret\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = body.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");

        mockMvc.perform(get("/api/secrets/{id}", id))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"message\":\"This is my secret\"}"));

        mockMvc.perform(get("/api/secrets/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("This secret has vanished."));
    }

    @Test
    void rejectsEmptyMessage() throws Exception {
        mockMvc.perform(post("/api/secrets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsWhitespaceOnlyMessage() throws Exception {
        mockMvc.perform(post("/api/secrets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"   \"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsMissingField() throws Exception {
        mockMvc.perform(post("/api/secrets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void acceptsExactly5000Characters() throws Exception {
        String message = "a".repeat(5000);

        mockMvc.perform(post("/api/secrets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"" + message + "\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void rejects5001Characters() throws Exception {
        String message = "a".repeat(5001);

        mockMvc.perform(post("/api/secrets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"" + message + "\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownIdReturns404() throws Exception {
        mockMvc.perform(get("/api/secrets/{id}", "7d6f4c2e-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }

    @Test
    void malformedIdReturns404() throws Exception {
        mockMvc.perform(get("/api/secrets/{id}", "not-a-uuid"))
                .andExpect(status().isNotFound());
    }
}

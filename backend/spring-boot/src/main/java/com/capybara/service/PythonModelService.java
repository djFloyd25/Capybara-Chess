package com.capybara.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class PythonModelService {

    @Value("${python.model.url}")
    private String pythonModelUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public PythonModelService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .version(HttpClient.Version.HTTP_1_1)
                .build();
    }

    public String generateStudyPlan(String rawGamesJson, String platform, String playerUsername) {
        try {
            JsonNode games = objectMapper.readTree(rawGamesJson);
            ObjectNode bodyNode = objectMapper.createObjectNode();
            bodyNode.set("games", games);
            bodyNode.put("platform", platform);
            bodyNode.put("player_username", playerUsername);
            String body = objectMapper.writeValueAsString(bodyNode);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(pythonModelUrl + "/generate"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofMinutes(5))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> response = httpClient
                    .send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Python model returned " + response.statusCode() + ": " + response.body());
            }
            return response.body();
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Python model unavailable: " + e.getMessage(), e);
        }
    }
}

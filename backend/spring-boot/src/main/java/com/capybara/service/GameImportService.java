package com.capybara.service;

import java.time.Duration;

import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.capybara.exception.GameImportException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

@Service
public class GameImportService {

    private static final String LICHESS_GAMES_URL =
            "https://lichess.org/api/games/user/{username}?max=200&rated=true&perfType=blitz,rapid,classical";
    private static final String CHESSCOM_ARCHIVES_URL =
            "https://api.chess.com/pub/player/{username}/games/archives";
    private static final String CHESSCOM_GAMES_URL_PREFIX =
            "https://api.chess.com/pub/player/";

    private static final int MAX_GAMES    = 200;
    private static final int MAX_MONTHS   = 12;

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GameImportService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(30));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    /**
     * Fetches games for the given platform/username and returns a JSON array string.
     * Lichess NDJSON is normalised to a JSON array so both platforms share the same shape.
     */
    public String fetchGames(String platform, String username) {
        return switch (platform.toLowerCase()) {
            case "lichess"   -> fetchLichessGames(username);
            case "chess.com" -> fetchChessComGames(username);
            default -> throw new IllegalArgumentException("Unsupported platform: " + platform);
        };
    }

    public int countGames(String gamesJson) {
        try {
            return objectMapper.readTree(gamesJson).size();
        } catch (Exception e) {
            return 0;
        }
    }

    // Lichess returns NDJSON (one JSON object per line). Convert to a JSON array.
    private String fetchLichessGames(String username) {
        String ndjson;
        try {
            ndjson = restClient.get()
                    .uri(LICHESS_GAMES_URL, username)
                    .header("Accept", "application/x-ndjson")
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException e) {
            throw new GameImportException(
                    "Lichess user '" + username + "' not found or API error: " + e.getStatusCode(), e);
        }

        try {
            ArrayNode games = objectMapper.createArrayNode();
            if (ndjson != null) {
                for (String line : ndjson.split("\n")) {
                    String trimmed = line.trim();
                    if (!trimmed.isEmpty()) {
                        games.add(objectMapper.readTree(trimmed));
                    }
                }
            }
            return objectMapper.writeValueAsString(games);
        } catch (Exception e) {
            return ndjson != null ? ndjson : "[]";
        }
    }

    // Chess.com: walk backwards through monthly archives until MAX_GAMES is reached or MAX_MONTHS tried.
    private String fetchChessComGames(String username) {
        try {
            String archivesJson = restClient.get()
                    .uri(CHESSCOM_ARCHIVES_URL, username)
                    .header("User-Agent", "CapybaraChess/1.0")
                    .retrieve()
                    .body(String.class);

            JsonNode archives = objectMapper.readTree(archivesJson).path("archives");
            if (archives.isEmpty()) return "[]";

            ArrayNode collected = objectMapper.createArrayNode();
            int monthsFetched = 0;

            for (int i = archives.size() - 1;
                 i >= 0 && collected.size() < MAX_GAMES && monthsFetched < MAX_MONTHS;
                 i--) {

                String archiveUrl = archives.get(i).asText();
                if (!archiveUrl.startsWith(CHESSCOM_GAMES_URL_PREFIX)) {
                    throw new GameImportException(
                            "Unexpected archive URL returned by Chess.com API: " + archiveUrl, null);
                }

                String monthJson = restClient.get()
                        .uri(archiveUrl)
                        .header("User-Agent", "CapybaraChess/1.0")
                        .retrieve()
                        .body(String.class);

                for (JsonNode game : objectMapper.readTree(monthJson).path("games")) {
                    if (collected.size() >= MAX_GAMES) break;
                    collected.add(game);
                }
                monthsFetched++;
            }

            return objectMapper.writeValueAsString(collected);
        } catch (RestClientResponseException e) {
            throw new GameImportException(
                    "Chess.com user '" + username + "' not found or API error: " + e.getStatusCode(), e);
        } catch (GameImportException e) {
            throw e;
        } catch (Exception e) {
            throw new GameImportException("Failed to fetch Chess.com games: " + e.getMessage(), e);
        }
    }
}

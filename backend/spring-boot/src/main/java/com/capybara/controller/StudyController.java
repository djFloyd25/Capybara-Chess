package com.capybara.controller;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;

import com.capybara.dto.GameImportRequest;
import com.capybara.exception.GameImportException;
import com.capybara.model.StudyPlan;
import com.capybara.model.User;
import com.capybara.repository.StudyRepository;
import com.capybara.service.GameImportService;
import com.capybara.service.PythonModelService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/study")
public class StudyController {

    private final StudyRepository studyRepository;
    private final GameImportService gameImportService;
    private final PythonModelService pythonModelService;
    private final ObjectMapper objectMapper;

    public StudyController(StudyRepository studyRepository,
                           GameImportService gameImportService,
                           PythonModelService pythonModelService,
                           ObjectMapper objectMapper) {
        this.studyRepository = studyRepository;
        this.gameImportService = gameImportService;
        this.pythonModelService = pythonModelService;
        this.objectMapper = objectMapper;
    }

    // Returns the saved study plan JSON, or 404 if none has been generated yet.
    @GetMapping("/plan")
    public ResponseEntity<Object> getStudyPlan(@AuthenticationPrincipal User user) throws JsonProcessingException {
        Optional<StudyPlan> planOpt = studyRepository.findByUserUsername(user.getUsername());
        if (planOpt.isEmpty() || planOpt.get().getPlanJson() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(objectMapper.readValue(planOpt.get().getPlanJson(), Object.class));
    }

    // Fetches games from Lichess or Chess.com and stores the raw JSON.
    // Returns { gameCount, platform } so the frontend can show a success message.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationErrors(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(message);
    }

    @Transactional
    @PostMapping("/import")
    public ResponseEntity<?> importGames(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GameImportRequest request) {
        try {
            String gamesJson = gameImportService.fetchGames(request.getPlatform(), request.getUsername());

            StudyPlan plan = studyRepository.findByUserUsername(user.getUsername())
                    .orElseGet(StudyPlan::new);

            plan.setUser(user);
            plan.setRawGamesJson(gamesJson);
            plan.setPlatform(request.getPlatform());
            plan.setImportedUsername(request.getUsername());
            plan.setUpdatedAt(LocalDateTime.now());

            studyRepository.save(plan);

            int count = gameImportService.countGames(gamesJson);
            return ResponseEntity.ok(Map.of("gameCount", count, "platform", request.getPlatform()));
        } catch (GameImportException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Calls the Python model with the stored raw games and saves the returned study plan.
    @PostMapping("/generate")
    public ResponseEntity<Object> generateStudyPlan(@AuthenticationPrincipal User user) throws JsonProcessingException {
        StudyPlan plan = studyRepository.findByUserUsername(user.getUsername())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No games imported yet. Call /study/import first."));

        if (plan.getRawGamesJson() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "No games imported yet. Call /study/import first.");
        }

        if (plan.getPlatform() == null || plan.getImportedUsername() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Imported games are missing platform/username metadata. Please re-import.");
        }

        int gameCount = gameImportService.countGames(plan.getRawGamesJson());
        if (gameCount < 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Not enough games to analyze (" + gameCount + " found, 50 required). " +
                    "Play more games or import from a different platform.");
        }

        try {
            String planJson = pythonModelService.generateStudyPlan(
                    plan.getRawGamesJson(), plan.getPlatform(), plan.getImportedUsername());
            plan.setPlanJson(planJson);
            plan.setGeneratedAt(LocalDateTime.now());
            plan.setUpdatedAt(LocalDateTime.now());
            studyRepository.save(plan);
            return ResponseEntity.ok(objectMapper.readValue(planJson, Object.class));
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage());
        }
    }
}

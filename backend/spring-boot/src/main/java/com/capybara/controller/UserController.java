package com.capybara.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.capybara.dto.UpdateProfileRequest;
import com.capybara.model.User;
import com.capybara.repository.UserRepository;
import com.capybara.service.UserService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id,
                                            @AuthenticationPrincipal User currentUser) {
        if (!currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
        if (request.getChessComUsername() != null)
            user.setChessComUsername(request.getChessComUsername());
        if (request.getLiChessUsername() != null)
            user.setLiChessUsername(request.getLiChessUsername());
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}

package com.capybara.controller;

import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.capybara.dto.AuthenticationRequest;
import com.capybara.dto.AuthenticationResponse;
import com.capybara.dto.OAuthRequest;
import com.capybara.dto.RegistrationRequest;
import com.capybara.model.User;
import com.capybara.repository.UserRepository;
import com.capybara.security.JwtUtil;
import com.capybara.service.CustomUserDetailsService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          CustomUserDetailsService userDetailsService,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          BCryptPasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);
        return ResponseEntity.ok(new AuthenticationResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistrationRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(Map.of("error", "Username or email already in use"));
        }
        return ResponseEntity.ok().body(Map.of("message", "User created successfully."));
    }

    @PostMapping("/oauth")
    public ResponseEntity<?> oauthLogin(@RequestBody OAuthRequest request) {
        User user = userRepository.findByProviderAndProviderId(request.getProvider(), request.getProviderId())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(request.getUsername());
                    newUser.setEmail(request.getEmail());
                    newUser.setProvider(request.getProvider());
                    newUser.setProviderId(request.getProviderId());
                    if ("lichess".equals(request.getProvider()))
                        newUser.setLiChessUsername(request.getUsername());
                    return userRepository.save(newUser);
                });
        return ResponseEntity.ok(new AuthenticationResponse(jwtUtil.generateToken(user)));
    }
}

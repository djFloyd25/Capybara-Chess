package com.capybara;

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

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder; 

    public AuthController(AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService, JwtUtil jwtUtil, UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) {
        // Authenticate the user
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authenticationRequest.getEmail(), 
                                        authenticationRequest.getPassword()));
        
        // Load user details
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getEmail());

        //Generate JWT token
        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthenticationResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistrationRequest registrationRequest) {
        User user = new User();
        user.setUsername(registrationRequest.getUsername());
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(Map.of("error", "Username or Email already in use"));
        }
        return ResponseEntity.ok().body(Map.of("message", "User created successfully."));
    }

    @PostMapping("/oauth")
    public ResponseEntity<?> oauthLogin(@RequestBody OAuthRequest oauthRequest) {
        // Check if user already exists
        User user = userRepository.findByProviderAndProviderId(oauthRequest.getProvider(), oauthRequest.getProviderId())
                .orElseGet(() -> {
                    // If not, create a new user
                    User newUser = new User();
                    newUser.setUsername(oauthRequest.getUsername());
                    if (oauthRequest.getProvider().equals("chesscom")) {
                        newUser.setChessComUsername(oauthRequest.getUsername());
                    } else if (oauthRequest.getProvider().equals("lichess")) {
                        newUser.setLiChessUsername(oauthRequest.getUsername());
                    }
                    newUser.setEmail(oauthRequest.getEmail());
                    newUser.setProvider(oauthRequest.getProvider());
                    newUser.setProviderId(oauthRequest.getProviderId());
                    return userRepository.save(newUser);
                });

        // Generate JWT token
        final String jwt = jwtUtil.generateToken(user);

        return ResponseEntity.ok(new AuthenticationResponse(jwt));
    }

}

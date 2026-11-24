package com.lakshya.backend.service;

import com.lakshya.backend.config.JwtConfig;
import com.lakshya.backend.model.User;
import com.lakshya.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Set<String> SELF_SIGNUP_ROLES = Set.of("STUDENT", "MENTOR");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtConfig jwtConfig;

    public User signup(String username, String email, String password, String role) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        String normalizedRole = role == null ? "STUDENT" : role.trim().toUpperCase();
        if (!SELF_SIGNUP_ROLES.contains(normalizedRole)) {
            throw new RuntimeException("Role must be STUDENT or MENTOR");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(normalizedRole);
        return userRepository.save(user);
    }

    /** Authenticates and returns the logged-in user plus a signed JWT. */
    public LoginResult login(String username, String password) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));
        User user = (User) auth.getPrincipal();
        return new LoginResult(jwtConfig.generateToken(user), user);
    }

    public record LoginResult(String token, User user) {}
}

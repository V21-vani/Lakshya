package com.lakshya.backend.controller;

import com.lakshya.backend.model.User;
import com.lakshya.backend.service.AuthService;
import com.lakshya.backend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public record SignupRequest(@NotBlank String username,
                                @NotBlank @Email String email,
                                @NotBlank @Size(min = 6) String password,
                                String role) {}

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    public record LoginResponse(String token, String tokenType, User user) {}

    @PostMapping("/signup")
    public ResponseEntity<User> register(@Valid @RequestBody SignupRequest req) {
        User user = authService.signup(req.username(), req.email(), req.password(), req.role());
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthService.LoginResult result = authService.login(req.username(), req.password());
        return ResponseEntity.ok(new LoginResponse(result.token(), "Bearer", result.user()));
    }

    /** Returns the currently authenticated user (requires Authorization: Bearer &lt;token&gt;). */
    @GetMapping("/me")
    public ResponseEntity<User> me() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    /** JWTs are stateless: the client just discards its token. Kept for frontend symmetry. */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}

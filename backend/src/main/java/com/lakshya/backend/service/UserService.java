package com.lakshya.backend.service;

import com.lakshya.backend.model.User;
import com.lakshya.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User principal)) {
            throw new RuntimeException("User must be authenticated to access this method");
        }
        // Re-load so the entity is attached to the current persistence context
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    @Transactional
    public User updateProfile(User userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setProfileImageUrl(userDetails.getProfileImageUrl());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setProfileCompleted(userDetails.isProfileCompleted());
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Iterable<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }
}
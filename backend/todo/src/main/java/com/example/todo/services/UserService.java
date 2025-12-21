package com.example.todo.services;

import com.example.todo.models.User;
import com.example.todo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Configuration
class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();// nekaj varnosti vseeno ne skodi :)
    }
}

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already taken");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        String passwordHash = passwordEncoder.encode(password);
        user.setPassword(passwordHash);

        return userRepository.save(user);
    }

    public User login(String usernameOrEmail, String password) {
        User user = userRepository.findByUsername(usernameOrEmail)
                .orElseGet(() -> userRepository.findByEmail(usernameOrEmail)
                        .orElseThrow(() -> new RuntimeException("User not found")));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return user;
    }

    public User updateUserProfile(Integer userId, String username, String email, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("No such user"));

        if (username != null && !username.isBlank()) {
            user.setUsername(username);
        }

        if (email != null && !email.isBlank()) {
            user.setEmail(email);
        }

        if (password != null && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
        }

        return userRepository.save(user);
    }

    public User getUserByToken(String token) {
        Integer userId = authorizationService.resolveToken(token);
        if (userId == null) {
            throw new RuntimeException("Invalid token");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("No such user"));
    }

    public List<String> getAllEmails() {
        return userRepository.findAllEmails();
    }
}

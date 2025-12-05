package com.example.todo.services;

import com.example.todo.models.User;
import com.example.todo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorizationService authorizationService;

    public User registerUser(String username, String email, String password) {
        // TODO: Implement user registration logic
        return null;
    }

    public User login(String username, String password) {
        // TODO: Implement login logic
        return null;
    }

    public User updateUserProfile(Integer userId, String username, String email, String password) {
        // TODO: Implement profile update logic
        return null;
    }

    public User getUserByToken(String token) {
        Integer userId = authorizationService.resolveToken(token);
        if (userId == null) {
            throw new RuntimeException("Invalid token");
        }
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("No such user"));
    }
}


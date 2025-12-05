package com.example.todo.services;

import com.example.todo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorizationService authorizationService;

    public void deleteUser(Integer userId) {
        // TODO: Implement user deletion logic
    }

    public void broadcastNotification(String message) {
        // TODO: Implement broadcast notification logic
    }

    public void sendNotification(Integer userId, String message) {
        // TODO: Implement send notification logic
    }
}


package com.example.todo.controllers;

import com.example.todo.dtos.UserDto;
import com.example.todo.dtos.UserLoginDto;
import com.example.todo.dtos.UserRegistrationDto;
import com.example.todo.models.User;
import com.example.todo.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173") // Vite
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody UserRegistrationDto request) {
        User user = userService.registerUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword());
        return ResponseEntity.ok(UserDto.from(user));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody UserLoginDto request) {
        User user = userService.login(
                request.getUsername(),
                request.getPassword());
        return ResponseEntity.ok(UserDto.from(user));
    }

    @GetMapping("/emails")
    public ResponseEntity<List<String>> getAllEmails() {
        return ResponseEntity.ok(userService.getAllEmails());
    }
}

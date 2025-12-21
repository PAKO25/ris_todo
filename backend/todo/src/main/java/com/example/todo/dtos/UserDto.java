package com.example.todo.dtos;

import com.example.todo.models.User;

public class UserDto {
    private Integer id;
    private String username;
    private String email;
    private String role;

    public static UserDto from(User user) {
        UserDto dto = new UserDto();
        dto.id = user.getId();
        dto.username = user.getUsername();
        dto.email = user.getEmail();
        dto.role = user.getRole().name();
        return dto;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

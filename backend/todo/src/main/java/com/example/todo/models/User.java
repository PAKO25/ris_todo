package com.example.todo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, unique = true, length = 45)
    private String username;
    
    @Column(nullable = false, unique = true, length = 45)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.REGULAR;
    
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TodoList> ownedLists;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Collaboration> collaborations;
    
    // Constructors
    public User() {}
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    public List<TodoList> getOwnedLists() { return ownedLists; }
    public void setOwnedLists(List<TodoList> ownedLists) { this.ownedLists = ownedLists; }
    
    public List<Collaboration> getCollaborations() { return collaborations; }
    public void setCollaborations(List<Collaboration> collaborations) { this.collaborations = collaborations; }
}

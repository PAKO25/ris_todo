package com.example.todo.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Tag(name="Todo API", description = "API for basic todo operations")
public class TodoHandler {

    @PersistenceContext
    private EntityManager entityManager;

    @Operation(summary = "Get all todos for a user")
    @GetMapping("/getTodos/{id}")
    public List getTodos(@PathVariable("id") String userId) {
        String sql = "SELECT id, title, description FROM todos WHERE user_id = :userId";
        return entityManager.createNativeQuery(sql)
                .setParameter("userId", userId)
                .getResultList();
    }

    @Operation(summary = "Get a specific todo by its id")
    @GetMapping("/getTodo/{id}")
    public List getTodo(@PathVariable("id") String todoId) {
        String sql = "SELECT title, description FROM todos WHERE id = :todoId";
        return entityManager.createNativeQuery(sql)
                .setParameter("todoId", todoId)
                .getResultList();
    }

    @PostMapping("/addTodo")
    @Transactional
    @Operation(summary = "Add a new todo")
    public boolean addTodo(@RequestBody Map<String, String> request) {
        try {
            String sql = "INSERT INTO todos (title, description, user_id) VALUES (:title, :description, :userId)";
            int rowsAffected = entityManager.createNativeQuery(sql)
                    .setParameter("title", request.get("title"))
                    .setParameter("description", request.get("description"))
                    .setParameter("userId", request.get("userId"))
                    .executeUpdate();

            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("Error when adding to todo: " + e.getMessage());
            return false;
        }
    }

    @DeleteMapping("/deleteTodo/{id}")
    @Transactional
    @Operation(summary = "Delete a todo by its id")
    public boolean deleteTodo(@PathVariable String id) {
        try {
            String sql = "DELETE FROM todos WHERE id = :id";
            int rowsAffected = entityManager.createNativeQuery(sql)
                    .setParameter("id", id)
                    .executeUpdate();

            return rowsAffected > 0;
        } catch (Exception e) {
            return false;
        }
    }

    @PutMapping("/updateTodo/{id}")
    @Transactional
    @Operation(summary = "Update an existing todo")
    public boolean updateTodo(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        try {
            String sql = "UPDATE todos SET title = :title, description = :description " +
                    "WHERE id = :id AND user_id = :userId";
            int rows = entityManager.createNativeQuery(sql)
                    .setParameter("title", body.get("title"))
                    .setParameter("description", body.get("description"))
                    .setParameter("id", id)
                    .setParameter("userId", body.get("userId"))
                    .executeUpdate();
            return rows > 0;
        } catch (Exception e) {
            return false;
        }
    }
}

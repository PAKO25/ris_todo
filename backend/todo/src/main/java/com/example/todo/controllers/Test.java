package com.example.todo.controllers;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Test {

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/hello")
    public String hello() {
        try {
            Query query = entityManager.createNativeQuery("SELECT 1;");
            query.getSingleResult();
            return "Server working, database working.";
        } catch (Exception e) {
            return "Server working, database error: " + e.getMessage();
        }
    }
}

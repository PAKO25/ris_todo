package com.example.todo.controllers;

import com.example.todo.models.User;
import com.example.todo.repositories.TodoItemRepository;
import com.example.todo.repositories.UserRepository;
import com.example.todo.services.TodoItemService;
import com.example.todo.services.TodoListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/lists")
@Tag(name="Todo List Controller", description = "Controller for todo list operations")
public class TodoListController {

    @Autowired
    TodoItemRepository todoItemRepository;
    @Autowired
    TodoItemService todoItemService;
    @Autowired
    UserRepository userRepository;
    @Autowired
    TodoListService todoListService;

    @PostMapping
    @Operation(summary = "Creates a new list")
    public void createList(@RequestBody Map<String, String> request) {
        User user = userRepository.findById(Integer.valueOf(request.get("userId"))).orElseThrow(() -> new RuntimeException("No such user"));
        todoListService.createList(user, request.get("title"));
    }

    @DeleteMapping("/{listId}")
    @Operation(summary = "Deletes a list")
    public void deleteList(@PathVariable("listId") int listId) {
        todoListService.deleteList(listId);
    }

    @PostMapping("/share")
    @Operation(summary = "Shares a list with another user")
    public void shareList(@RequestParam("listId") int listId, @RequestParam("userId") int userId) {
        todoListService.shareList(listId, userId);
    }

    @PutMapping("changeShareStatus/{listId}")
    @Operation(summary = "Changes the share status of a list")
    public void changeShareStatus(@PathVariable("listId") int listId, @RequestParam("isShared") Boolean isShared) {
        todoListService.toggleListSharedStatus(listId, isShared);
    }

    @DeleteMapping("/removeCollaborator")
    @Operation(summary = "Removes a collaborator from a shared list")
    public void removeCollaborator(@RequestParam("listId") int listId, @RequestParam("userId") int userId) {
        todoListService.removeCollaborator(listId, userId);
    }
}
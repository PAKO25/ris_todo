package com.example.todo.controllers;

import com.example.todo.dtos.*;
import com.example.todo.models.*;
import com.example.todo.repositories.TodoItemRepository;
import com.example.todo.repositories.UserRepository;
import com.example.todo.services.TodoItemService;
import com.example.todo.services.TodoListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/lists")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Todo List Controller", description = "Controller for todo list operations")
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
    public TodoListDto createList(@RequestBody TodoListCreateDto request) {
        User user = userRepository.findByEmail(request.getOwnerEmail())
                .orElseThrow(() -> new RuntimeException("No such user"));

        boolean isShared = request.getIsShared() != null && request.getIsShared();

        TodoList created = todoListService.createList(user, request.getTitle(), isShared);
        return TodoListDto.from(created);
    }

    @GetMapping
    @Operation(summary = "Gets all lists for a user by email")
    public List<TodoListDto> getListsForUser(@RequestParam("ownerEmail") String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("No such user"));

        return todoListService.getListsForUser(owner).stream()
                .map(TodoListDto::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{listId}/items")
    @Operation(summary = "Gets all todo items for a list")
    public List<TodoItemDto> getItemsForList(@PathVariable("listId") Integer listId) {
        return todoItemService.getItemsForList(listId).stream()
                .map(TodoItemDto::from)
                .collect(Collectors.toList());
    }

    @PostMapping("/{listId}/items")
    @Operation(summary = "Creates a new todo item in the given list")
    public TodoItemDto createItemForList(
            @PathVariable("listId") Integer listId,
            @RequestBody TodoItemCreateDto request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Title is required");
        }

        KanbanLevel level;
        try {
            level = request.getKanbanLevel() != null
                    ? KanbanLevel.valueOf(request.getKanbanLevel())
                    : KanbanLevel.TODO;
        } catch (IllegalArgumentException ex) {
            level = KanbanLevel.TODO;
        }

        Priority priority;
        try {
            priority = request.getPriority() != null
                    ? Priority.valueOf(request.getPriority())
                    : Priority.MEDIUM;
        } catch (IllegalArgumentException ex) {
            priority = Priority.MEDIUM;
        }

        LocalDateTime deadline = null;
        if (request.getDeadline() != null && !request.getDeadline().isBlank()) {
            try {
                deadline = LocalDateTime.parse(request.getDeadline());
            } catch (Exception ex) {
            }
        }

        TodoItem item = todoItemService.createItem(
                listId,
                request.getTitle(),
                request.getDescription(),
                deadline,
                level,
                priority,
                request.getImage());

        return TodoItemDto.from(item);
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

package com.example.todo.controllers;

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
@Tag(name="Todo List Controller", description = "Controller for todo list operations")
public class TodoListController {

    static class CreateListRequest {
        private String ownerEmail;
        private String title;
        private Boolean isShared;

        public String getOwnerEmail() { return ownerEmail; }
        public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public Boolean getIsShared() { return isShared; }
        public void setIsShared(Boolean isShared) { this.isShared = isShared; }
    }

    static class TodoListResponse {
        private Integer id;
        private String title;
        private Boolean isShared;
        private String ownerEmail;

        public static TodoListResponse from(TodoList list) {
            TodoListResponse dto = new TodoListResponse();
            dto.id = list.getId();
            dto.title = list.getTitle();
            dto.isShared = list.getIsShared();
            dto.ownerEmail = list.getOwner().getEmail();
            return dto;
        }

        public Integer getId() { return id; }
        public String getTitle() { return title; }
        public Boolean getIsShared() { return isShared; }
        public String getOwnerEmail() { return ownerEmail; }


        static class TodoItemResponse {
            private Integer id;
            private String title;
            private String description;
            private Boolean isCompleted;
            private LocalDateTime deadline;
            private String kanbanLevel;
            private String priority;

            public static TodoItemResponse from(TodoItem item) {
                TodoItemResponse dto = new TodoItemResponse();
                dto.id = item.getId();
                dto.title = item.getTitle();
                dto.description = item.getDescription();
                dto.isCompleted = item.getIsCompleted();
                dto.deadline = item.getDeadline();
                dto.kanbanLevel = item.getKanbanLevel() != null ? item.getKanbanLevel().name() : null;
                dto.priority = item.getPriority() != null ? item.getPriority().name() : null;
                return dto;
            }

            public Integer getId() { return id; }
            public String getTitle() { return title; }
            public String getDescription() { return description; }
            public Boolean getIsCompleted() { return isCompleted; }
            public LocalDateTime getDeadline() { return deadline; }
            public String getKanbanLevel() { return kanbanLevel; }
            public String getPriority() { return priority; }
        }

        static class CreateItemRequest {
            private String title;
            private String description;
            private String deadline;
            private String kanbanLevel;
            private String priority;

            public String getTitle() { return title; }
            public void setTitle(String title) { this.title = title; }

            public String getDescription() { return description; }
            public void setDescription(String description) { this.description = description; }

            public String getDeadline() { return deadline; }
            public void setDeadline(String deadline) { this.deadline = deadline; }

            public String getKanbanLevel() { return kanbanLevel; }
            public void setKanbanLevel(String kanbanLevel) { this.kanbanLevel = kanbanLevel; }

            public String getPriority() { return priority; }
            public void setPriority(String priority) { this.priority = priority; }
        }
    }

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
    public TodoListResponse createList(@RequestBody CreateListRequest request) {
        User user = userRepository.findByEmail(request.getOwnerEmail())
                .orElseThrow(() -> new RuntimeException("No such user"));

        boolean isShared = request.getIsShared() != null && request.getIsShared();

        TodoList created = todoListService.createList(user, request.getTitle(), isShared);
        return TodoListResponse.from(created);
    }

    @GetMapping
    @Operation(summary = "Gets all lists for a user by email")
    public List<TodoListResponse> getListsForUser(@RequestParam("ownerEmail") String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("No such user"));

        return todoListService.getListsForUser(owner).stream()
                .map(TodoListResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{listId}/items")
    @Operation(summary = "Gets all todo items for a list")
    public List<TodoListResponse.TodoItemResponse> getItemsForList(@PathVariable("listId") Integer listId) {
        return todoItemService.getItemsForList(listId).stream()
                .map(TodoListResponse.TodoItemResponse::from)
                .collect(Collectors.toList());
    }

    @PostMapping("/{listId}/items")
    @Operation(summary = "Creates a new todo item in the given list")
    public TodoListResponse.TodoItemResponse createItemForList(
            @PathVariable("listId") Integer listId,
            @RequestBody TodoListResponse.CreateItemRequest request
    ) {
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
                priority
        );

        return TodoListResponse.TodoItemResponse.from(item);
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

package com.example.todo.controllers;

import com.example.todo.models.Priority;
import com.example.todo.models.TodoItem;
import com.example.todo.repositories.TodoItemRepository;
import com.example.todo.services.TodoItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/items")
@Tag(name="Todo Item Controller", description = "Controller for todo item operations")
public class TodoItemController {

    @Autowired
    TodoItemRepository todoItemRepository;
    @Autowired
    TodoItemService todoItemService;

    @Operation(summary = "Get all todos from a list")
    @GetMapping("/{listId}")
    public List<TodoItem> getTodos(@PathVariable("listId") Integer listId) {
        return todoItemRepository.findByListId(listId);
    }

    @Operation(summary = "Get todos from index to index from a list")
    @GetMapping()
    public List getTodosInRange(@RequestParam("userId") int userId,
                                @RequestParam("pageNumber") int pageNumber,
                                @RequestParam("size") int size) {

        Pageable pageable = PageRequest.of(pageNumber, size);
        return todoItemRepository.findByListIdPaginated(userId, pageable).getContent();
    }


    @PostMapping()
    @Operation(summary = "Add a new todo")
    public void addTodo(@RequestBody Map<String, String> request) {
        todoItemService.addTodo(Integer.valueOf(request.get("listId")), request.get("title"), request.get("description"), Priority.valueOf(request.get("priority")));
    }

    @DeleteMapping("/{todoId}")
    @Operation(summary = "Delete a todo by its id")
    public void deleteTodo(@PathVariable("todoId") int todoId) {
        todoItemService.deleteTodo(todoId);
    }

    @PutMapping("/{todoId}")
    @Operation(summary = "Update an existing todo")
    public void updateTodo(@PathVariable("todoId") int todoId, @RequestBody java.util.Map<String, String> body) {
        todoItemService.updateTodo(todoId, body.get("title"), body.get("description"), Priority.valueOf(body.get("priority")));
    }
}
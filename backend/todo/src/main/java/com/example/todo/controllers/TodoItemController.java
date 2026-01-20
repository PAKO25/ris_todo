package com.example.todo.controllers;

import com.example.todo.dtos.TodoItemCreateDto;
import com.example.todo.models.KanbanLevel;
import com.example.todo.models.Priority;
import com.example.todo.models.TodoItem;
import com.example.todo.repositories.TodoItemRepository;
import com.example.todo.services.TodoItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Todo Item Controller", description = "Controller for todo item operations")
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
    public List<TodoItem> getTodosInRange(@RequestParam("userId") int userId,
            @RequestParam("pageNumber") int pageNumber,
            @RequestParam("size") int size) {

        Pageable pageable = PageRequest.of(pageNumber, size);
        return todoItemRepository.findByListIdPaginated(userId, pageable).getContent();
    }

    @PostMapping()
    @Operation(summary = "Add a new todo")
    public void addTodo(@RequestParam("listId") Integer listId, @RequestBody TodoItemCreateDto request) {
        todoItemService.addTodo(
                listId,
                request.getTitle(),
                request.getDescription(),
                Priority.valueOf(request.getPriority()),
                KanbanLevel.valueOf(request.getKanbanLevel()),
                request.getImage());
    }

    @DeleteMapping("/{todoId}")
    @Operation(summary = "Delete a todo by its id")
    public void deleteTodo(@PathVariable("todoId") int todoId) {
        todoItemService.deleteTodo(todoId);
    }

    @PutMapping("/{todoId}")
    @Operation(summary = "Update an existing todo")
    public void updateTodo(@PathVariable("todoId") int todoId, @RequestBody TodoItemCreateDto body) {
        todoItemService.updateTodo(
                todoId,
                body.getTitle(),
                body.getDescription(),
                Priority.valueOf(body.getPriority()),
                KanbanLevel.valueOf(body.getKanbanLevel()),
                body.getImage());
    }
}
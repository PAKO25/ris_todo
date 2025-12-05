package com.example.todo.services;

import com.example.todo.models.Priority;
import com.example.todo.models.TodoItem;
import com.example.todo.models.TodoList;
import com.example.todo.models.User;
import com.example.todo.repositories.TodoItemRepository;
import com.example.todo.repositories.TodoListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TodoItemService {

    @Autowired
    private TodoItemRepository itemRepository;

    @Autowired
    private TodoListRepository listRepository;

    @Autowired
    private AuthorizationService authorizationService;

    @Transactional
    public TodoItem addTodo(Integer listId, String title, String description, Priority priority) {
        TodoList list = listRepository.findById(listId).orElseThrow(() -> new RuntimeException("No such list"));

        TodoItem item = new TodoItem();
        item.setTitle(title);
        item.setDescription(description);
        item.setPriority(priority != null ? priority : Priority.MEDIUM);
        item.setIsCompleted(false);
        item.setList(list);

        return itemRepository.save(item);
    }

    @Transactional
    public void deleteTodo(Integer todoId) {
        TodoItem item = itemRepository.findById(todoId).orElseThrow(() -> new RuntimeException("No such todo"));
        itemRepository.delete(item);
    }

    @Transactional
    public TodoItem updateTodo(Integer todoId, String title, String description, Priority priority) {
        TodoItem item = itemRepository.findById(todoId).orElseThrow(() -> new RuntimeException("No such todo"));

        if (title != null) {
            item.setTitle(title);
        }
        if (description != null) {
            item.setDescription(description);
        }
        if (priority != null) {
            item.setPriority(priority);
        }

        return itemRepository.save(item);
    }

    @Transactional
    public void setTodoDeadline(Integer todoId, LocalDateTime deadline) {
        TodoItem item = itemRepository.findById(todoId) .orElseThrow(() -> new RuntimeException("No such todo"));
        item.setDeadline(deadline);
        itemRepository.save(item);
    }

    @Transactional
    public void toggleTodoCompletion(Integer todoId) {
        TodoItem item = itemRepository.findById(todoId).orElseThrow(() -> new RuntimeException("No such todo"));
        item.setIsCompleted(!item.getIsCompleted());
        itemRepository.save(item);
    }
}


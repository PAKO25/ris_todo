package com.example.todo.dtos;

import com.example.todo.models.TodoItem;
import java.time.LocalDateTime;

public class TodoItemDto {
    private Integer id;
    private String title;
    private String description;
    private Boolean isCompleted;
    private LocalDateTime deadline;
    private String kanbanLevel;
    private String priority;

    public static TodoItemDto from(TodoItem item) {
        TodoItemDto dto = new TodoItemDto();
        dto.id = item.getId();
        dto.title = item.getTitle();
        dto.description = item.getDescription();
        dto.isCompleted = item.getIsCompleted();
        dto.deadline = item.getDeadline();
        dto.kanbanLevel = item.getKanbanLevel() != null ? item.getKanbanLevel().name() : null;
        dto.priority = item.getPriority() != null ? item.getPriority().name() : null;
        return dto;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public String getKanbanLevel() {
        return kanbanLevel;
    }

    public void setKanbanLevel(String kanbanLevel) {
        this.kanbanLevel = kanbanLevel;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}

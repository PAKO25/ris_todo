package com.example.todo.dtos;

public class TodoItemCreateDto {
    private String title;
    private String description;
    private String deadline;
    private String kanbanLevel;
    private String priority;

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

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
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

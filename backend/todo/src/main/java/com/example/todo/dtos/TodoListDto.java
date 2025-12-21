package com.example.todo.dtos;

import com.example.todo.models.TodoList;

public class TodoListDto {
    private Integer id;
    private String title;
    private Boolean isShared;
    private String ownerEmail;

    public static TodoListDto from(TodoList list) {
        TodoListDto dto = new TodoListDto();
        dto.id = list.getId();
        dto.title = list.getTitle();
        dto.isShared = list.getIsShared();
        dto.ownerEmail = list.getOwner().getEmail();
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

    public Boolean getIsShared() {
        return isShared;
    }

    public void setIsShared(Boolean isShared) {
        this.isShared = isShared;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }
}

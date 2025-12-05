package com.example.todo.repositories;

import com.example.todo.models.TodoItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TodoItemRepository extends JpaRepository<TodoItem, Integer> {

    Optional<TodoItem> findById(Integer id);

    @Query("SELECT i FROM TodoItem i WHERE i.list.id = :listId")
    List<TodoItem> findByListId(@Param("listId") Integer listId);

    @Query("SELECT i FROM TodoItem i WHERE i.list.id = :listId")
    Page<TodoItem> findByListIdPaginated(@Param("listId") Integer listId, Pageable pageable);
}

package com.example.todo.repositories;

import com.example.todo.models.TodoList;
import com.example.todo.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TodoListRepository extends JpaRepository<TodoList, Integer> {

    Optional<TodoList> findById(Integer id);

    List<TodoList> findByOwner(User owner);

    @Query("SELECT c.list FROM Collaboration c WHERE c.user = :user")
    List<TodoList> findByCollaborationUser(@Param("user") User user);

    @Query("SELECT l FROM TodoList l JOIN FETCH l.owner WHERE l.owner = :owner")
    List<TodoList> findByOwnerWithOwner(@Param("owner") User owner);

}

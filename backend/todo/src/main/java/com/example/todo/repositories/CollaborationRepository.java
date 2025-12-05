package com.example.todo.repositories;

import com.example.todo.models.Collaboration;
import com.example.todo.models.TodoList;
import com.example.todo.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollaborationRepository extends JpaRepository<Collaboration, Integer> {

    List<Collaboration> findByUser(User user);

    List<Collaboration> findByList(TodoList list);

    Optional<Collaboration> findByUserAndList(User user, TodoList list);
}


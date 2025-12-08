package com.example.todo.services;

import com.example.todo.models.Collaboration;
import com.example.todo.models.TodoItem;
import com.example.todo.models.TodoList;
import com.example.todo.models.User;
import com.example.todo.repositories.CollaborationRepository;
import com.example.todo.repositories.TodoListRepository;
import com.example.todo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.List;

@Service
public class TodoListService {

    @Autowired
    private TodoListRepository listRepository;

    @Autowired
    private CollaborationRepository collaborationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorizationService authorizationService;

    @Transactional
    public TodoList createList(User user, String title, boolean isShared) {
        TodoList todoList = new TodoList();
        todoList.setTitle(title);
        todoList.setOwner(user);
        todoList.setIsShared(isShared);
        return listRepository.save(todoList);
    }

    @Transactional
    public TodoList createListForOwnerEmail(String ownerEmail, String title, boolean isShared) {
        User owner = (User) userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner with email " + ownerEmail + " not found"));

        return createList(owner, title, isShared);
    }

    @Transactional(readOnly = true)
    public List<TodoList> getListsForUser(User owner) {
        return listRepository.findByOwnerWithOwner(owner);
    }


    @Transactional
    public void deleteList(Integer listId) {
        TodoList list = listRepository.findById(listId).orElseThrow(() -> new RuntimeException("No such list"));
        listRepository.delete(list);
    }

    @Transactional
    public void shareList(Integer listId, Integer userId) {
        TodoList list = listRepository.findById(listId).orElseThrow(() -> new RuntimeException("No such list"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("No such user"));

        //preveri če že je že collaborator
        if (collaborationRepository.findByUserAndList(user, list).isPresent()) {
            throw new RuntimeException("Collaboration already exists");
        }

        Collaboration collaboration = new Collaboration();
        collaboration.setUser(user);
        collaboration.setList(list);
        collaborationRepository.save(collaboration);
    }

    @Transactional
    public void removeCollaborator(Integer listId, Integer userId) {
        TodoList list = listRepository.findById(listId).orElseThrow(() -> new RuntimeException("No such list"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("No such user"));
        Collaboration collaboration = collaborationRepository.findByUserAndList(user, list).orElseThrow(() -> new RuntimeException("No such collaboration"));
        collaborationRepository.delete(collaboration);
    }

    @Transactional
    public void toggleListSharedStatus(Integer listId, Boolean isShared) {
        TodoList list = listRepository.findById(listId).orElseThrow(() -> new RuntimeException("No such list"));
        list.setIsShared(isShared != null ? isShared : !list.getIsShared());
        listRepository.save(list);
    }

    public File exportListAsPdf(Integer listId) {
        // TODO: Implement PDF export functionality
        return null;
    }
}


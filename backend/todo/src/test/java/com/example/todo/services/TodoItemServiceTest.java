package com.example.todo.services;

import com.example.todo.models.*;
import com.example.todo.repositories.TodoItemRepository;
import com.example.todo.repositories.TodoListRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TodoItemServiceTest {

    @Autowired
    TodoItemService todoItemService;

    @Autowired
    TodoListRepository todoListRepository;

    @Autowired
    TodoItemRepository todoItemRepository;

    @Autowired
    UserService userService;

    private TodoList list;

    @BeforeEach
    void beforeEach() {
        User owner = userService.registerUser(
                "test-user-toggle",
                "toggle@example.com",
                "password"
        );

        list = new TodoList();
        list.setTitle("Test List");
        list.setOwner(owner);
        list = todoListRepository.save(list);
    }

    //preveri če se ob klicu toggleTodoCompletion spremeni isCompleted iz false v true
    @Test
    void uncompletedTogglesToCompleted() {
        TodoItem item = new TodoItem();
        item.setTitle("Test Item");
        item.setDescription("Should toggle completion");
        item.setKanbanLevel(KanbanLevel.TODO);
        item.setPriority(Priority.MEDIUM);
        item.setIsCompleted(false);
        item.setList(list);
        item = todoItemRepository.save(item);

        Integer itemId = item.getId();
        assertNotNull(itemId);
        assertFalse(item.getIsCompleted(), "Na začetku je uncompleted.");

        todoItemService.toggleTodoCompletion(itemId);

        TodoItem reloaded = todoItemRepository.findById(itemId).orElseThrow(() -> new AssertionError("Todo more obstajati."));

        assertTrue(reloaded.getIsCompleted(), "Na koncu more bit completed.");
    }

    //preveri če se ob klicu toggleTodoCompletion spremeni isCompleted iz true v false
    @Test
    void completedTogglesToUncompleted() {
        TodoItem item = new TodoItem();
        item.setTitle("Test Item");
        item.setDescription("Should toggle completion");
        item.setKanbanLevel(KanbanLevel.TODO);
        item.setPriority(Priority.MEDIUM);
        item.setIsCompleted(true);
        item.setList(list);
        item = todoItemRepository.save(item);

        Integer itemId = item.getId();
        assertNotNull(itemId);
        assertTrue(item.getIsCompleted(), "Na začetku je completed.");

        todoItemService.toggleTodoCompletion(itemId);

        TodoItem reloaded = todoItemRepository.findById(itemId).orElseThrow(() -> new AssertionError("Todo more obstajati"));

        assertFalse(reloaded.getIsCompleted(), "Na koncu more bit uncompleted.");
    }

    //preveri če se ob klicu toggleTodoCompletion sproži napaka, če todo z danim ID-jem ne obstaja
    @Test
    void toggleTodoCompletionWithInvalidIdThrows() {
        Integer invalidId = -1;

        assertThrows(RuntimeException.class, () -> todoItemService.toggleTodoCompletion(invalidId),
                "Pri neveljavnem ID-ju se mora sprožiti RuntimeException");
    }

    //preveri če se ob klicu addTodo ustvari nov todo in če je pravilno nastavljen.
    @Test
    void addCreatesNewItemInRepository() {
        long countBefore = todoItemRepository.count();

        TodoItem created = todoItemService.addTodo(list.getId(), "t", "d", null, KanbanLevel.TODO);

        long countAfter = todoItemRepository.count();
        assertEquals(countBefore + 1, countAfter, "Število todojev se more povečat za 1");

        TodoItem reloaded = todoItemRepository.findById(created.getId())
                .orElseThrow(() -> new AssertionError("Todo more obstajati"));

        assertEquals("t", reloaded.getTitle());
        assertEquals("d", reloaded.getDescription());
        assertEquals(list.getId(), reloaded.getList().getId());
        assertEquals(Priority.MEDIUM, reloaded.getPriority(), "Privzeta prioriteta more bit MEDIUM");
        assertEquals(KanbanLevel.TODO, reloaded.getKanbanLevel());
        assertFalse(reloaded.getIsCompleted(), "Novi todoji morejo biti uncomplete");
    }

    //preveri, da addTodo z neveljavnim ID-jem seznama sproži napako
    @Test
    void addTodoWithInvalidListIdThrows() {
        Integer invalidListId = -1;

        assertThrows(RuntimeException.class,
                () -> todoItemService.addTodo(invalidListId, "t", "d", null, KanbanLevel.TODO),
                "Pri neveljavnem ID-ju seznama se mora sprožiti RuntimeException");
    }

    //preveri, ali se prioriteta ohranja in, če je povezan na pravilni seznam opravil
    @ParameterizedTest
    @EnumSource(value = Priority.class, names = {"LOW", "MEDIUM", "HIGH"})
    void addTodoWithExplicitPriorityPersists(Priority priority) {
        TodoItem created = todoItemService.addTodo(list.getId(), "Nov todo", "nas testni todo", priority, KanbanLevel.TODO);
        assertNotNull(created.getId(), "Todo nima ID-ja");

        TodoItem reloaded = todoItemRepository.findById(created.getId()).orElseThrow(() -> new AssertionError("Todo-ja ni v bazi"));

        assertEquals(priority, reloaded.getPriority(), "Prioriteta ni ostala enaka kot podana");
        assertEquals(list.getId(), reloaded.getList().getId(), "Todo ni vezan na pravilen seznam opravil");
    }

    //preveri ali se spremeni samo isCompleted in se ostala polja ohranijo svoje prvotno stanje
    @Test
    void toggleCompletionOnlyFlipsCompletedFlag() {
        TodoItem item = new TodoItem();
        item.setTitle("Test item");
        item.setDescription("Nas predragi opis");
        item.setKanbanLevel(KanbanLevel.REVIEW);
        item.setPriority(Priority.LOW);
        item.setIsCompleted(false);
        item.setList(list);
        item = todoItemRepository.save(item);

        Integer id = item.getId();
        assertNotNull(id);

        todoItemService.toggleTodoCompletion(id);

        TodoItem reloaded = todoItemRepository.findById(id).orElseThrow(() -> new AssertionError("Todo mora obstajati oz. ni najden po ID-ju"));

        assertTrue(reloaded.getIsCompleted(), "isCompleted se bi moral spremeniti na true");

        assertEquals("Test item", reloaded.getTitle(), "Title se ne sme spremeniti");
        assertEquals("Nas predragi opis", reloaded.getDescription(), "Description se ne sme spremeniti");
        assertEquals(Priority.LOW, reloaded.getPriority(), "Priority se ne sme spremeniti");
        assertEquals(KanbanLevel.REVIEW, reloaded.getKanbanLevel(), "Kanban level se ne sme spremeniti");
        assertEquals(list.getId(), reloaded.getList().getId(), "List povezava mora ostati enaka");
    }

    //preverimo ali se dva zaporedna premika iz isCompleted vrne na prvotno stanje
    @Test
    void toggleTwiceReturnsToOriginalState() {
        TodoItem item = new TodoItem();
        item.setTitle("Double Toggle");
        item.setDescription("Should end where it started");
        item.setKanbanLevel(KanbanLevel.TODO);
        item.setPriority(Priority.MEDIUM);
        item.setIsCompleted(false);
        item.setList(list);
        item = todoItemRepository.save(item);

        Integer id = item.getId();
        assertNotNull(id);

        todoItemService.toggleTodoCompletion(id);
        todoItemService.toggleTodoCompletion(id);

        TodoItem reloaded = todoItemRepository.findById(id).orElseThrow(() -> new AssertionError("Todo mora obstajati po dveh premikih isCompleted"));

        assertFalse(reloaded.getIsCompleted(), "Todo ni ohranil isCompleted po dveh premikih");
    }
}
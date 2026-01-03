DROP SCHEMA if exists todo_ris;
CREATE SCHEMA todo_ris;

DROP USER IF EXISTS 'todo_backend'@'%';
CREATE USER 'todo_backend'@'%' IDENTIFIED BY 'geslo123';
GRANT ALL PRIVILEGES ON todo_ris.* TO 'todo_backend'@'%';
FLUSH PRIVILEGES;

USE todo_ris;

DROP TABLE IF EXISTS todo_items;
DROP TABLE IF EXISTS collaborations;
DROP TABLE IF EXISTS todo_lists;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(45) NOT NULL UNIQUE,
    email VARCHAR(45) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('REGULAR', 'ADMINISTRATOR') NOT NULL DEFAULT 'REGULAR'
);

CREATE TABLE IF NOT EXISTS todo_lists (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    owner_id INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS collaborations (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    list_id INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (list_id) REFERENCES todo_lists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS todo_items (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    deadline DATETIME,
    kanban_level ENUM('TODO', 'INPROGRESS', 'REVIEW', 'DONE') NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    list_id INTEGER NOT NULL,
    image LONGTEXT,
    FOREIGN KEY (list_id) REFERENCES todo_lists(id) ON DELETE CASCADE
);



INSERT INTO users (username, email, password, role) VALUES 
    ('admin', 'admin@example.com', '$2a$10$ux1wQsLvBPSmciqPdi0/sOsmyZn2qA4xbFi1nsdWQWPW8ywYUeVEq', 'ADMINISTRATOR'),
    ('testuser', 'test@example.com', '$2a$10$ux1wQsLvBPSmciqPdi0/sOsmyZn2qA4xbFi1nsdWQWPW8ywYUeVEq', 'REGULAR');
# password: geslo123

INSERT INTO todo_lists (title, is_shared, owner_id) VALUES 
    ('Personal Tasks', FALSE, 2),
    ('Work Projects', TRUE, 2),
    ('Shopping List', FALSE, 1);

INSERT INTO collaborations (user_id, list_id) VALUES (1, 2);

INSERT INTO todo_items (title, description, is_completed, deadline, kanban_level, priority, list_id) VALUES
    ('Buy groceries', 'Milk, bread, eggs', FALSE, '2025-12-10 18:00:00', 'TODO', 'HIGH', 1),
    ('Finish report', 'Complete the quarterly report', FALSE, '2025-12-08 17:00:00', 'TODO', 'HIGH', 1),
    ('Workout', 'Go for a 30-minute run', FALSE, NULL, 'TODO', 'MEDIUM', 1),
    ('Read book', 'Read 50 pages of a novel', TRUE, NULL, 'DONE', 'LOW', 1),
    ('Team meeting preparation', 'Prepare slides for Monday meeting', FALSE, '2025-12-09 09:00:00', 'TODO', 'HIGH', 2),
    ('Code review', 'Review pull requests', FALSE, NULL, 'INPROGRESS', 'MEDIUM', 2);
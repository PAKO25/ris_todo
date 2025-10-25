DROP SCHEMA if exists todo_ris;
CREATE SCHEMA todo_ris;

DROP USER IF EXISTS 'todo_backend'@'localhost';
CREATE USER 'todo_backend'@'localhost' IDENTIFIED BY 'geslo123';
GRANT ALL PRIVILEGES ON todo_ris.* TO 'todo_backend'@'localhost';
FLUSH PRIVILEGES;

USE todo_ris

DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(45) NOT NULL UNIQUE,
    email VARCHAR(45) NOT NULL UNIQUE,
    password VARCHAR(45) NOT NULL
);

CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (username, email, password)
VALUES ('testuser', 'test@example.com', 'password123');

INSERT INTO todos (title, description, user_id)
VALUES 
    ('Buy groceries', 'Milk, bread, eggs', 1),
    ('Finish report', 'Complete the quarterly report', 1),
    ('Workout', 'Go for a 30-minute run', 1),
    ('Read book', 'Read 50 pages of a novel', 1);
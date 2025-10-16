DROP SCHEMA if exists todo_ris;
CREATE SCHEMA todo_ris;

DROP USER IF EXISTS 'todo_backend'@'localhost';
CREATE USER 'todo_backend'@'localhost' IDENTIFIED BY 'geslo123';
GRANT ALL PRIVILEGES ON todo_ris.* TO 'todo_backend'@'localhost';
FLUSH PRIVILEGES;
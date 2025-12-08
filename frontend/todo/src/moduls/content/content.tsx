import React, { useEffect, useState } from "react";
import "./content.css";
import {
    get_todo_items_for_list,
    type TodoItemDTO,
    create_todo_item_api,
} from "../../API/todo/todoItemAPI";
import { get_user_todoListCache_all } from "../../cache/todoListCache.ts";
import jsPDF from "jspdf";

type TaskTag = "low" | "medium" | "high";

type Task = {
    id: number;
    title: string;
    tag: TaskTag;
    date?: string;
};

type ColumnId = "todo" | "in-progress" | "review" | "done";

type Column = {
    id: ColumnId;
    title: string;
    tasks: Task[];
};

type ContentProps = {
    selectedListId: number | null;
};

const baseColumns: Column[] = [
    { id: "todo",        title: "To do",       tasks: [] },
    { id: "in-progress", title: "In progress", tasks: [] },
    { id: "review",      title: "Review",      tasks: [] },
    { id: "done",        title: "Done",        tasks: [] },
];

const priorityToTag = (priority: string | null | undefined): TaskTag => {
    switch ((priority || "").toUpperCase()) {
        case "LOW":
            return "low";
        case "HIGH":
            return "high";
        default:
            return "medium";
    }
};

const mapItemsToColumns = (items: TodoItemDTO[]): Column[] => {
    const cols: Column[] = baseColumns.map((c) => ({ ...c, tasks: [] }));
    const findCol = (id: ColumnId) => cols.find((c) => c.id === id)!;

    items.forEach((item) => {
        let columnId: ColumnId;

        switch ((item.kanbanLevel || "").toUpperCase()) {
            case "TODO":
                columnId = "todo";
                break;
            case "IN_PROGRESS":
                columnId = "in-progress";
                break;
            case "REVIEW":
                columnId = "review";
                break;
            case "DONE":
                columnId = "done";
                break;
            default:
                columnId = "todo";
        }

        const tag = priorityToTag(item.priority);

        let date: string | undefined;
        if (item.deadline) {
            const d = new Date(item.deadline);
            if (!Number.isNaN(d.getTime())) {
                date = d.toLocaleDateString("sl-SI");
            }
        }

        const task: Task = {
            id: item.id,
            title: item.title,
            tag,
            date,
        };

        findCol(columnId).tasks.push(task);
    });

    return cols;
};

const columnIdToKanbanLevel = (columnId: ColumnId): string => {
    switch (columnId) {
        case "todo":
            return "TODO";
        case "in-progress":
            return "IN_PROGRESS";
        case "review":
            return "REVIEW";
        case "done":
            return "DONE";
        default:
            return "TODO";
    }
};

function Content({ selectedListId }: ContentProps) {
    const [columns, setColumns] = useState<Column[]>(baseColumns);
    const [dragged, setDragged] = useState<{
        taskId: number;
        fromColumnId: ColumnId;
    } | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<ColumnId | null>(
        null
    );
    const [loading, setLoading] = useState(false);

    const [activeNewTaskColumn, setActiveNewTaskColumn] =
        useState<ColumnId | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [savingNewTask, setSavingNewTask] = useState(false);

    let pageTitle = "Kanban board";
    if (selectedListId != null) {
        const list = get_user_todoListCache_all().find(
            (l) => l.id === selectedListId
        );
        if (list) {
            pageTitle = list.title;
        }
    }

    useEffect(() => {
        if (selectedListId == null) {
            setColumns(baseColumns);
            return;
        }

        setLoading(true);
        get_todo_items_for_list(selectedListId)
            .then((items) => {
                setColumns(mapItemsToColumns(items));
            })
            .catch((err) => {
                console.error("Napaka pri nalaganju opravil:", err);
                setColumns(baseColumns);
            })
            .finally(() => setLoading(false));
    }, [selectedListId]);

    const handleDragStart = (
        event: React.DragEvent<HTMLElement>,
        taskId: number,
        fromColumnId: ColumnId
    ) => {
        setDragged({ taskId, fromColumnId });
        event.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (
        event: React.DragEvent<HTMLElement>,
        columnId: ColumnId
    ) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDragOverColumnId(columnId);
    };

    const handleDragLeave = (
        event: React.DragEvent<HTMLElement>,
        columnId: ColumnId
    ) => {
        if (
            (event.currentTarget as HTMLElement).contains(
                event.relatedTarget as Node
            )
        ) {
            return;
        }
        if (dragOverColumnId === columnId) {
            setDragOverColumnId(null);
        }
    };

    const handleDrop = (
        event: React.DragEvent<HTMLElement>,
        toColumnId: ColumnId
    ) => {
        event.preventDefault();
        if (!dragged) return;

        setColumns((prev) => {
            const { taskId, fromColumnId } = dragged;

            const fromColumn = prev.find((c) => c.id === fromColumnId);
            const toColumn = prev.find((c) => c.id === toColumnId);

            if (!fromColumn || !toColumn) return prev;
            if (fromColumnId === toColumnId) {
                return prev;
            }

            const fromTasks = [...fromColumn.tasks];
            const taskIndex = fromTasks.findIndex((t) => t.id === taskId);
            if (taskIndex === -1) return prev;

            const [task] = fromTasks.splice(taskIndex, 1);
            const toTasks = [...toColumn.tasks, task];

            return prev.map((col) => {
                if (col.id === fromColumnId) {
                    return { ...col, tasks: fromTasks };
                }
                if (col.id === toColumnId) {
                    return { ...col, tasks: toTasks };
                }
                return col;
            });
        });

        // TODO: pol za backend se...

        setDragged(null);
        setDragOverColumnId(null);
    };

    const handleExportPdf = () => {
        if (selectedListId == null) {
            alert("Najprej izberi seznam.");
            return;
        }

        const doc = new jsPDF();
        let y = 10;

        doc.setFontSize(16);
        doc.text(pageTitle, 10, y);
        y += 10;

        const prioOrder: TaskTag[] = ["high", "medium", "low"];
        const prioLabel: Record<TaskTag, string> = {
            high: "High",
            medium: "Medium",
            low: "Low",
        };

        columns.forEach((column) => {
            if (y > 270) {
                doc.addPage();
                y = 10;
            }

            doc.setFontSize(14);
            doc.text(column.title, 10, y);
            y += 7;

            prioOrder.forEach((p) => {
                const tasksForPrio = column.tasks.filter((t) => t.tag === p);
                if (tasksForPrio.length === 0) return;

                // Naslov prioritete
                doc.setFontSize(12);
                doc.text(`Priority: ${prioLabel[p]}`, 12, y);
                y += 5;

                tasksForPrio.forEach((task) => {
                    const line =
                        "• " +
                        task.title +
                        (task.date ? ` (${task.date})` : "");

                    const lines = doc.splitTextToSize(line, 180);
                    lines.forEach((l: string | string[]) => {
                        if (y > 280) {
                            doc.addPage();
                            y = 10;
                        }
                        doc.text(l, 16, y);
                        y += 5;
                    });
                });

                y += 3;
            });

            y += 5;
        });

        const safeTitle =
            pageTitle.trim().length > 0
                ? pageTitle.replace(/[^\p{L}\p{N}_-]+/gu, "_")
                : "todo_list";

        const filename = `${safeTitle}_kanban.pdf`;
        doc.save(filename);
    };


    const handleDragEnd = () => {
        setDragged(null);
        setDragOverColumnId(null);
    };

    const getTagClassName = (tag: TaskTag) => {
        switch (tag) {
            case "low":
                return "task_tag_low";
            case "medium":
                return "task_tag_medium";
            case "high":
                return "task_tag_high";
            default:
                return "";
        }
    };

    const getTagLabel = (tag: TaskTag) => {
        switch (tag) {
            case "low":
                return "Low";
            case "medium":
                return "Medium";
            case "high":
                return "High";
        }
    };

    const handleCreateTask = async (
        e: React.FormEvent,
        columnId: ColumnId
    ) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        if (selectedListId == null) return;

        try {
            setSavingNewTask(true);
            const dto = await create_todo_item_api(selectedListId, {
                title: newTaskTitle.trim(),
                kanbanLevel: columnIdToKanbanLevel(columnId),
                priority: "MEDIUM",
            });

            const tag = priorityToTag(dto.priority);
            let date: string | undefined;
            if (dto.deadline) {
                const d = new Date(dto.deadline);
                if (!Number.isNaN(d.getTime())) {
                    date = d.toLocaleDateString("sl-SI");
                }
            }

            const newTask: Task = {
                id: dto.id,
                title: dto.title,
                tag,
                date,
            };

            setColumns((prev) =>
                prev.map((col) =>
                    col.id === columnId
                        ? { ...col, tasks: [...col.tasks, newTask] }
                        : col
                )
            );

            setNewTaskTitle("");
            setActiveNewTaskColumn(null);
        } catch (err: unknown) {
            console.error("Napaka pri ustvarjanju opravila:", err);
            alert(
                err ||
                "Napaka pri ustvarjanju opravila. Poskusi znova."
            );
        } finally {
            setSavingNewTask(false);
        }
    };

    return (
        <div className="content">
            <header className="content_header">
                <h1 className="page_title">{pageTitle}</h1>

                {selectedListId != null && (
                    <button
                        className="export_button"
                        type="button"
                        onClick={handleExportPdf}
                    >
                        Export PDF
                    </button>
                )}
            </header>


            {selectedListId == null && (
                <p className="content_hint">Izberi seznam v levem meniju.</p>
            )}

            {loading && <p>Nalagam opravila...</p>}

            {selectedListId != null && columns.map((column) => (
                <section
                    key={column.id}
                    className={
                        "kanban_column" +
                        (dragOverColumnId === column.id
                            ? " kanban_column--drag-over"
                            : "")
                    }
                    onDragOver={(event) => handleDragOver(event, column.id)}
                    onDrop={(event) => handleDrop(event, column.id)}
                    onDragLeave={(event) => handleDragLeave(event, column.id)}
                >
                    <header className="kanban_column_header">
                        <div className="kanban_column_title">
                            <span className="kanban_column_name">
                                {column.title}
                            </span>
                            <span className="kanban_column_count">
                                {column.tasks.length}
                            </span>
                        </div>
                        <div className="kanban_column_actions">
                            <button
                                className="icon_button"
                                onClick={() => {
                                    if (selectedListId == null) return;
                                    setActiveNewTaskColumn(column.id);
                                    setNewTaskTitle("");
                                }}
                            >
                                +
                            </button>
                            <button className="icon_button">⋯</button>
                        </div>
                    </header>

                    <div className="kanban_column_body">
                        {activeNewTaskColumn === column.id && (
                            <form
                                className="task_new_form"
                                onSubmit={(e) => handleCreateTask(e, column.id)}
                            >
                                <input
                                    type="text"
                                    className="task_new_input"
                                    placeholder="Novo opravilo..."
                                    value={newTaskTitle}
                                    onChange={(e) =>
                                        setNewTaskTitle(e.target.value)
                                    }
                                    disabled={savingNewTask}
                                />
                                <button
                                    type="submit"
                                    className="task_new_button"
                                    disabled={savingNewTask}
                                >
                                    Dodaj
                                </button>
                            </form>
                        )}

                        {column.tasks.map((task) => (
                            <article
                                key={task.id}
                                className={
                                    "task_card" +
                                    (dragged && dragged.taskId === task.id
                                        ? " task_card--dragging"
                                        : "")
                                }
                                draggable
                                onDragStart={(event) =>
                                    handleDragStart(event, task.id, column.id)
                                }
                                onDragEnd={handleDragEnd}
                            >
                                <h3 className="task_title">{task.title}</h3>
                                <div className="task_footer">
                                    <span className={getTagClassName(task.tag)}>
                                        {getTagLabel(task.tag)}
                                    </span>
                                    {task.date && (
                                        <span className="task_meta">
                                            {task.date}
                                        </span>
                                    )}
                                </div>
                            </article>
                        ))}

                        {column.tasks.length === 0 &&
                            !loading &&
                            activeNewTaskColumn !== column.id && (
                                <div className="kanban_column_empty">
                                    Ni opravil v tem stolpcu.
                                </div>
                            )}
                    </div>
                </section>
            ))}
        </div>
    );
}

export default Content;

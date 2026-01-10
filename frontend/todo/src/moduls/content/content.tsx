import React, { useEffect, useRef, useState } from "react";
import "./content.css";
import {
    get_todo_items_for_list,
    type TodoItemDTO,
    create_todo_item_api,
    update_todo_item_api,
} from "../../API/todo/todoItemAPI";
import { get_user_todoListCache_all } from "../../cache/todoListCache.ts";
import jsPDF from "jspdf";
import Progress from "./progress/progress.tsx";
import { isDone, getDoneDurationHours} from "./progress/estimate/estimate.ts";
import Estimate from "./progress/estimate/Estimate.tsx";

type TaskTag = "low" | "medium" | "high";

type Task = {
    id: number;
    title: string;
    tag: TaskTag;
    date?: string;
    image?: string;
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
    { id: "todo", title: "To do", tasks: [] },
    { id: "in-progress", title: "In progress", tasks: [] },
    { id: "review", title: "Review", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
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

const mapItemsToColumns = (todoItems: TodoItemDTO[]): Column[] => {
    if (import.meta.env.DEV) {
        console.log("first 5 done flags:", todoItems.slice(0, 5).map(isDone));
        console.log("first 5 durations:", todoItems.slice(0, 5).map(getDoneDurationHours));
    }

    const cols: Column[] = baseColumns.map((c) => ({ ...c, tasks: [] }));
    const findCol = (id: ColumnId) => cols.find((c) => c.id === id)!;

    todoItems.forEach((item) => {
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
            if (!Number.isNaN(d.getTime())) date = d.toLocaleDateString("sl-SI");
        }

        const task: Task = {
            id: item.id,
            title: item.title,
            tag,
            date,
            image: (item as any).image ?? undefined,
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
    const [items, setItems] = useState<TodoItemDTO[]>([]);
    const [columns, setColumns] = useState<Column[]>(baseColumns);
    const [dragged, setDragged] = useState<{ taskId: number; fromColumnId: ColumnId } | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<ColumnId | null>(null);
    const [loading, setLoading] = useState(false);

    const [activeNewTaskColumn, setActiveNewTaskColumn] = useState<ColumnId | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [savingNewTask, setSavingNewTask] = useState(false);

    const [newTaskImageBase64, setNewTaskImageBase64] = useState<string | null>(null);
    const [newTaskImageName, setNewTaskImageName] = useState<string | null>(null);
    const [isNewImageDropActive, setIsNewImageDropActive] = useState(false);
    const newTaskFileInputRef = useRef<HTMLInputElement | null>(null);

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingColumnId, setEditingColumnId] = useState<ColumnId | null>(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [editTaskImage, setEditTaskImage] = useState<string | null>(null);
    const [editTaskImageName, setEditTaskImageName] = useState<string | null>(null);
    const [savingEditTask, setSavingEditTask] = useState(false);
    const [isEditImageDropActive, setIsEditImageDropActive] = useState(false);
    const editTaskFileInputRef = useRef<HTMLInputElement | null>(null);

    let pageTitle = "Kanban board";
    if (selectedListId != null) {
        const list = get_user_todoListCache_all().find((l) => l.id === selectedListId);
        if (list) pageTitle = list.title;
    }

    const applyItems = (newItems: TodoItemDTO[]) => {
        setItems(newItems);
        setColumns(mapItemsToColumns(newItems));
    };

    const resetNewTaskImage = () => {
        setNewTaskImageBase64(null);
        setNewTaskImageName(null);
        setIsNewImageDropActive(false);
        if (newTaskFileInputRef.current) newTaskFileInputRef.current.value = "";
    };

    const resetEditTaskImage = () => {
        setEditTaskImage(null);
        setEditTaskImageName(null);
        setIsEditImageDropActive(false);
        if (editTaskFileInputRef.current) editTaskFileInputRef.current.value = "";
    };

    const closeEditForm = () => {
        setEditingTaskId(null);
        setEditingColumnId(null);
        setEditTaskTitle("");
        resetEditTaskImage();
    };

    const openNewTaskImagePicker = () => newTaskFileInputRef.current?.click();
    const openEditTaskImagePicker = () => editTaskFileInputRef.current?.click();

    const loadFileAsBase64 = (
        file: File,
        setBase64: (v: string) => void,
        setName: (v: string) => void
    ) => {
        const MAX_MB = 2;
        if (!file.type.startsWith("image/")) {
            alert("Prosimo izberi slikovno datoteko.");
            return;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
            alert(`Slika je prevelika (max ${MAX_MB}MB).`);
            return;
        }
        setName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => setBase64(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleNewTaskImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        loadFileAsBase64(file, (v) => setNewTaskImageBase64(v), (n) => setNewTaskImageName(n));
    };

    const handleEditTaskImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        loadFileAsBase64(file, (v) => setEditTaskImage(v), (n) => setEditTaskImageName(n));
    };

    const handleNewTaskImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsNewImageDropActive(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        loadFileAsBase64(file, (v) => setNewTaskImageBase64(v), (n) => setNewTaskImageName(n));
    };

    const handleEditTaskImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsEditImageDropActive(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        loadFileAsBase64(file, (v) => setEditTaskImage(v), (n) => setEditTaskImageName(n));
    };

    useEffect(() => {
        if (selectedListId == null) {
            setItems([]);
            setColumns(baseColumns);
            setActiveNewTaskColumn(null);
            setNewTaskTitle("");
            resetNewTaskImage();
            closeEditForm();
            return;
        }

        setActiveNewTaskColumn(null);
        setNewTaskTitle("");
        resetNewTaskImage();
        closeEditForm();

        const run = async () => {
            setLoading(true);
            try {
                const fetched = await get_todo_items_for_list(selectedListId);
                //to je samo za test dokler ni vzpostavljeno z backendom
                if (fetched.length === 0) {
                    const mock: any[] = [
                        // DONE: 6h
                        { id: 1, title: "Done task 1", done: true, createdAt: "2026-01-10T08:00:00.000Z", doneAt: "2026-01-10T14:00:00.000Z", kanbanLevel: "DONE", priority: "HIGH" },
                        // DONE: 4h
                        { id: 2, title: "Done task 2", done: true, createdAt: "2026-01-10T10:00:00.000Z", doneAt: "2026-01-10T14:00:00.000Z", kanbanLevel: "DONE", priority: "LOW" },

                        { id: 3, title: "Open 1", done: false, createdAt: "2026-01-10T11:00:00.000Z", kanbanLevel: "TODO", priority: "MEDIUM" },
                        { id: 4, title: "Open 2", done: false, createdAt: "2026-01-10T12:00:00.000Z", kanbanLevel: "IN_PROGRESS", priority: "MEDIUM" },
                        { id: 5, title: "Open 3", done: false, createdAt: "2026-01-10T12:30:00.000Z", kanbanLevel: "REVIEW", priority: "LOW" },
                        { id: 6, title: "Open 4", done: false, createdAt: "2026-01-10T13:00:00.000Z", kanbanLevel: "TODO", priority: "HIGH" },
                        { id: 7, title: "Open 5", done: false, createdAt: "2026-01-10T13:30:00.000Z", kanbanLevel: "IN_PROGRESS", priority: "LOW" },
                        { id: 8, title: "Open 6", done: false, createdAt: "2026-01-10T14:00:00.000Z", kanbanLevel: "TODO", priority: "MEDIUM" },
                        { id: 9, title: "Open 7", done: false, createdAt: "2026-01-10T14:30:00.000Z", kanbanLevel: "REVIEW", priority: "MEDIUM" },
                        { id: 10, title: "Open 8", done: false, createdAt: "2026-01-10T15:00:00.000Z", kanbanLevel: "TODO", priority: "LOW" },
                        { id: 11, title: "Open 9", done: false, createdAt: "2026-01-10T15:30:00.000Z", kanbanLevel: "IN_PROGRESS", priority: "HIGH" },
                        { id: 12, title: "Open 10", done: false, createdAt: "2026-01-10T16:00:00.000Z", kanbanLevel: "REVIEW", priority: "LOW" },
                    ];

                    applyItems(mock as TodoItemDTO[]);
                } else {
                    applyItems(fetched);
                }
            } catch (e) {
                if (import.meta.env.DEV) {
                    const mock: any[] = [
                        // DONE: 6h
                        { id: 1, title: "Done task 1", done: true, createdAt: "2026-01-10T08:00:00.000Z", doneAt: "2026-01-10T14:00:00.000Z", kanbanLevel: "DONE", priority: "HIGH" },
                        // DONE: 4h
                        { id: 2, title: "Done task 2", done: true, createdAt: "2026-01-10T10:00:00.000Z", doneAt: "2026-01-10T14:00:00.000Z", kanbanLevel: "DONE", priority: "LOW" },

                        { id: 3, title: "Open 1", done: false, createdAt: "2026-01-10T11:00:00.000Z", kanbanLevel: "TODO", priority: "MEDIUM" },
                        { id: 4, title: "Open 2", done: false, createdAt: "2026-01-10T12:00:00.000Z", kanbanLevel: "IN_PROGRESS", priority: "MEDIUM" },
                        { id: 5, title: "Open 3", done: false, createdAt: "2026-01-10T12:30:00.000Z", kanbanLevel: "REVIEW", priority: "LOW" },
                        { id: 6, title: "Open 4", done: false, createdAt: "2026-01-10T13:00:00.000Z", kanbanLevel: "TODO", priority: "HIGH" },
                        { id: 7, title: "Open 5", done: false, createdAt: "2026-01-10T13:30:00.000Z", kanbanLevel: "IN_PROGRESS", priority: "LOW" },
                        { id: 8, title: "Open 6", done: false, createdAt: "2026-01-10T14:00:00.000Z", kanbanLevel: "TODO", priority: "MEDIUM" },
                        { id: 9, title: "Open 7", done: false, createdAt: "2026-01-10T14:30:00.000Z", kanbanLevel: "REVIEW", priority: "MEDIUM" },
                        { id: 10, title: "Open 8", done: false, createdAt: "2026-01-10T15:00:00.000Z", kanbanLevel: "TODO", priority: "LOW" },
                        { id: 11, title: "Open 9", done: false, createdAt: "2026-01-10T15:30:00.000Z", kanbanLevel: "IN_PROGRESS", priority: "HIGH" },
                        { id: 12, title: "Open 10", done: false, createdAt: "2026-01-10T16:00:00.000Z", kanbanLevel: "REVIEW", priority: "LOW" },
                    ];

                    applyItems(mock as TodoItemDTO[]);
                } else {
                    applyItems([]);
                }
            } finally {
                setLoading(false);
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedListId]);

    const handleDragStart = (event: React.DragEvent<HTMLElement>, taskId: number, fromColumnId: ColumnId) => {
        setDragged({ taskId, fromColumnId });
        event.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (event: React.DragEvent<HTMLElement>, columnId: ColumnId) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDragOverColumnId(columnId);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLElement>, columnId: ColumnId) => {
        if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) return;
        if (dragOverColumnId === columnId) setDragOverColumnId(null);
    };

    const handleDrop = (event: React.DragEvent<HTMLElement>, toColumnId: ColumnId) => {
        event.preventDefault();
        if (!dragged) return;

        setColumns((prev) => {
            const { taskId, fromColumnId } = dragged;
            const fromColumn = prev.find((c) => c.id === fromColumnId);
            const toColumn = prev.find((c) => c.id === toColumnId);
            if (!fromColumn || !toColumn) return prev;
            if (fromColumnId === toColumnId) return prev;

            const fromTasks = [...fromColumn.tasks];
            const taskIndex = fromTasks.findIndex((t) => t.id === taskId);
            if (taskIndex === -1) return prev;

            const [task] = fromTasks.splice(taskIndex, 1);
            const toTasks = [...toColumn.tasks, task];

            return prev.map((col) => {
                if (col.id === fromColumnId) return { ...col, tasks: fromTasks };
                if (col.id === toColumnId) return { ...col, tasks: toTasks };
                return col;
            });
        });

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
        const prioLabel: Record<TaskTag, string> = { high: "High", medium: "Medium", low: "Low" };

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

                doc.setFontSize(12);
                doc.text(`Priority: ${prioLabel[p]}`, 12, y);
                y += 5;

                tasksForPrio.forEach((task) => {
                    const line = "• " + task.title + (task.date ? ` (${task.date})` : "");
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
            pageTitle.trim().length > 0 ? pageTitle.replace(/[^\p{L}\p{N}_-]+/gu, "_") : "todo_list";
        doc.save(`${safeTitle}_kanban.pdf`);
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

    const handleCreateTask = async (e: React.FormEvent, columnId: ColumnId) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        if (selectedListId == null) return;

        try {
            setSavingNewTask(true);

            const dto = await create_todo_item_api(selectedListId, {
                title: newTaskTitle.trim(),
                kanbanLevel: columnIdToKanbanLevel(columnId),
                priority: "MEDIUM",
                image: newTaskImageBase64 ?? undefined,
            } as any);

            const tag = priorityToTag(dto.priority);
            let date: string | undefined;
            if (dto.deadline) {
                const d = new Date(dto.deadline);
                if (!Number.isNaN(d.getTime())) date = d.toLocaleDateString("sl-SI");
            }

            const newTask: Task = {
                id: dto.id,
                title: dto.title,
                tag,
                date,
                image: (dto as any).image ?? newTaskImageBase64 ?? undefined,
            };

            setColumns((prev) =>
                prev.map((col) => (col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col))
            );

            setNewTaskTitle("");
            setActiveNewTaskColumn(null);
            resetNewTaskImage();
        } catch (err: unknown) {
            console.error("Napaka pri ustvarjanju opravila:", err);
            alert(err || "Napaka pri ustvarjanju opravila. Poskusi znova.");
        } finally {
            setSavingNewTask(false);
        }
    };

    const startEditTask = (columnId: ColumnId, task: Task) => {
        setActiveNewTaskColumn(null);
        setNewTaskTitle("");
        resetNewTaskImage();

        setEditingTaskId(task.id);
        setEditingColumnId(columnId);
        setEditTaskTitle(task.title);

        setEditTaskImage(task.image ?? null);
        setEditTaskImageName(task.image ? "obstoječa_slika" : null);

        if (editTaskFileInputRef.current) editTaskFileInputRef.current.value = "";
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTaskId == null || editingColumnId == null) return;
        if (!editTaskTitle.trim()) return;

        try {
            setSavingEditTask(true);

            const dto = await update_todo_item_api(editingTaskId, {
                title: editTaskTitle.trim(),
                image: editTaskImage ?? undefined,
            } as any);

            const updatedTitle = (dto as any).title ?? editTaskTitle.trim();
            const updatedImage = (dto as any).image ?? editTaskImage ?? undefined;

            setColumns((prev) =>
                prev.map((col) => {
                    if (col.id !== editingColumnId) return col;
                    return {
                        ...col,
                        tasks: col.tasks.map((t) =>
                            t.id === editingTaskId ? { ...t, title: updatedTitle, image: updatedImage } : t
                        ),
                    };
                })
            );

            closeEditForm();
        } catch (err: unknown) {
            console.error("Napaka pri posodabljanju opravila:", err);
            alert(err || "Napaka pri posodabljanju opravila. Poskusi znova.");
        } finally {
            setSavingEditTask(false);
        }
    };

    return (
        <div className="content">
            <header className="content_header">
                <h1 className="page_title">{pageTitle}</h1>

                {selectedListId != null && (
                    <button className="export_button" type="button" onClick={handleExportPdf}>
                        Export PDF
                    </button>
                )}
            </header>

            {selectedListId == null && <p className="content_hint">Izberi seznam v levem meniju.</p>}
            {loading && <p>Nalagam opravila...</p>}

            {selectedListId != null && (
                <div className="kanban_top">
                    <Progress columns={columns} />
                    <Estimate items={items} />
                </div>
            )}

            {selectedListId != null &&
                columns.map((column) => (
                    <section
                        key={column.id}
                        className={
                            "kanban_column" + (dragOverColumnId === column.id ? " kanban_column--drag-over" : "")
                        }
                        onDragOver={(event) => handleDragOver(event, column.id)}
                        onDrop={(event) => handleDrop(event, column.id)}
                        onDragLeave={(event) => handleDragLeave(event, column.id)}
                    >
                        <header className="kanban_column_header">
                            <div className="kanban_column_title">
                                <span className="kanban_column_name">{column.title}</span>
                                <span className="kanban_column_count">{column.tasks.length}</span>
                            </div>
                            <div className="kanban_column_actions">
                                <button
                                    className="icon_button"
                                    onClick={() => {
                                        if (selectedListId == null) return;
                                        closeEditForm();
                                        setActiveNewTaskColumn(column.id);
                                        setNewTaskTitle("");
                                        resetNewTaskImage();
                                    }}
                                >
                                    +
                                </button>
                                <button className="icon_button">⋯</button>
                            </div>
                        </header>

                        <div className="kanban_column_body">
                            {activeNewTaskColumn === column.id && (
                                <form className="task_new_form task_new_form--rows" onSubmit={(e) => handleCreateTask(e, column.id)}>
                                    <div className="task_new_row">
                                        <input
                                            type="text"
                                            className="task_new_input"
                                            placeholder="Novo opravilo..."
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            disabled={savingNewTask}
                                        />
                                    </div>

                                    <input
                                        ref={newTaskFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleNewTaskImageChange}
                                    />

                                    <div className="task_new_row">
                                        <div
                                            className={
                                                "task_new_image_dropzone" +
                                                (isNewImageDropActive ? " task_new_image_dropzone--active" : "")
                                            }
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setIsNewImageDropActive(true);
                                            }}
                                            onDragLeave={(e) => {
                                                if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
                                                setIsNewImageDropActive(false);
                                            }}
                                            onDrop={handleNewTaskImageDrop}
                                        >
                                            <div className="task_new_image_row">
                                                <button
                                                    type="button"
                                                    className="task_new_image_button"
                                                    onClick={openNewTaskImagePicker}
                                                    disabled={savingNewTask}
                                                >
                                                    {newTaskImageBase64 ? "Zamenjaj sliko" : "Dodaj sliko"}
                                                </button>

                                                {newTaskImageBase64 && (
                                                    <button
                                                        type="button"
                                                        className="task_new_image_remove"
                                                        onClick={resetNewTaskImage}
                                                        disabled={savingNewTask}
                                                    >
                                                        Odstrani
                                                    </button>
                                                )}
                                            </div>

                                            {!newTaskImageBase64 ? (
                                                <div className="task_new_image_hint">
                                                    Povleci sliko sem ali klikni “Dodaj sliko”.
                                                </div>
                                            ) : (
                                                <div className="task_new_image_preview">
                                                    <div className="task_new_image_name">{newTaskImageName ?? "slika"}</div>
                                                    <img
                                                        src={newTaskImageBase64}
                                                        alt="Predogled"
                                                        style={{
                                                            maxWidth: "100%",
                                                            maxHeight: "180px",
                                                            borderRadius: "8px",
                                                            marginTop: "8px",
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="task_new_row task_new_row--actions">
                                        <button
                                            type="submit"
                                            className="task_new_button task_new_button--full"
                                            disabled={savingNewTask}
                                        >
                                            Dodaj opravilo
                                        </button>
                                    </div>
                                </form>
                            )}

                            {column.tasks.map((task) => (
                                <React.Fragment key={task.id}>
                                    {editingTaskId === task.id && editingColumnId === column.id && (
                                        <form className="task_new_form task_new_form--rows task_edit_form" onSubmit={handleUpdateTask}>
                                            <div className="task_new_row">
                                                <input
                                                    type="text"
                                                    className="task_new_input"
                                                    placeholder="Naziv opravila..."
                                                    value={editTaskTitle}
                                                    onChange={(e) => setEditTaskTitle(e.target.value)}
                                                    disabled={savingEditTask}
                                                />
                                            </div>

                                            <input
                                                ref={editTaskFileInputRef}
                                                type="file"
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                onChange={handleEditTaskImageChange}
                                            />

                                            <div className="task_new_row">
                                                <div
                                                    className={
                                                        "task_new_image_dropzone" +
                                                        (isEditImageDropActive ? " task_new_image_dropzone--active" : "")
                                                    }
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        setIsEditImageDropActive(true);
                                                    }}
                                                    onDragLeave={(e) => {
                                                        if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
                                                        setIsEditImageDropActive(false);
                                                    }}
                                                    onDrop={handleEditTaskImageDrop}
                                                >
                                                    <div className="task_new_image_row">
                                                        <button
                                                            type="button"
                                                            className="task_new_image_button"
                                                            onClick={openEditTaskImagePicker}
                                                            disabled={savingEditTask}
                                                        >
                                                            {editTaskImage ? "Zamenjaj sliko" : "Dodaj sliko"}
                                                        </button>

                                                        {editTaskImage && (
                                                            <button
                                                                type="button"
                                                                className="task_new_image_remove"
                                                                onClick={resetEditTaskImage}
                                                                disabled={savingEditTask}
                                                            >
                                                                Odstrani
                                                            </button>
                                                        )}
                                                    </div>

                                                    {!editTaskImage ? (
                                                        <div className="task_new_image_hint">
                                                            Povleci sliko sem ali klikni “Dodaj sliko”.
                                                        </div>
                                                    ) : (
                                                        <div className="task_new_image_preview">
                                                            <div className="task_new_image_name">{editTaskImageName ?? "slika"}</div>
                                                            <img
                                                                src={editTaskImage}
                                                                alt="Predogled"
                                                                style={{
                                                                    maxWidth: "100%",
                                                                    maxHeight: "180px",
                                                                    borderRadius: "8px",
                                                                    marginTop: "8px",
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="task_new_row task_new_row--actions task_edit_actions">
                                                <button type="button" className="task_new_button" onClick={closeEditForm} disabled={savingEditTask}>
                                                    Prekliči
                                                </button>
                                                <button type="submit" className="task_new_button task_new_button--full" disabled={savingEditTask}>
                                                    Posodobi
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <article
                                        className={
                                            "task_card" + (dragged && dragged.taskId === task.id ? " task_card--dragging" : "")
                                        }
                                        draggable={!(editingTaskId === task.id)}
                                        onDragStart={(event) => handleDragStart(event, task.id, column.id)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        {task.image && (
                                            <img
                                                src={task.image}
                                                alt="Task"
                                                className="task_image"
                                                style={{
                                                    width: "100%",
                                                    maxHeight: "140px",
                                                    objectFit: "cover",
                                                    borderRadius: "10px",
                                                    marginBottom: "8px",
                                                }}
                                            />
                                        )}

                                        <div className="task_header_row">
                                            <h3 className="task_title">{task.title}</h3>
                                            <button
                                                type="button"
                                                className="task_more_button"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditTask(column.id, task);
                                                }}
                                                title="Uredi"
                                                aria-label="Uredi"
                                            >
                                                ⋯
                                            </button>
                                        </div>

                                        <div className="task_footer">
                                            <span className={getTagClassName(task.tag)}>{getTagLabel(task.tag)}</span>
                                            {task.date && <span className="task_meta">{task.date}</span>}
                                        </div>
                                    </article>
                                </React.Fragment>
                            ))}
                            {column.tasks.length === 0 && !loading && activeNewTaskColumn !== column.id && (
                                <div className="kanban_column_empty">Ni opravil v tem stolpcu.</div>
                            )}
                        </div>
                    </section>
                ))}
        </div>
    );
}

export default Content;

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
import { isDone } from "./progress/estimate/estimate.ts";
import Estimate from "./progress/estimate/Estimate.tsx";
import EditTaskModal from "./EditTaskModal.tsx";
// FocusPanel logic moved to parent


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
    onOpenFocus: (task: any) => void;
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

function Content({ selectedListId, onOpenFocus }: ContentProps) {
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

    const [editingTask, setEditingTask] = useState<TodoItemDTO | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

    // Removed unused resetEditTaskImage

    const closeEditForm = () => {
        setIsEditModalOpen(false);
        setEditingTask(null);
    };

    const openNewTaskImagePicker = () => newTaskFileInputRef.current?.click();

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

    const handleNewTaskImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsNewImageDropActive(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        loadFileAsBase64(file, (v) => setNewTaskImageBase64(v), (n) => setNewTaskImageName(n));
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
                applyItems(fetched);
            } catch (e) {
                applyItems([]);
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

        const { taskId, fromColumnId } = dragged;
        if (fromColumnId === toColumnId) {
            setDragged(null);
            setDragOverColumnId(null);
            return;
        }

        setColumns((prev) => {
            const fromColumn = prev.find((c) => c.id === fromColumnId);
            const toColumn = prev.find((c) => c.id === toColumnId);
            if (!fromColumn || !toColumn) return prev;

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

        const isCompleted = toColumnId === "done";
        const newKanbanLevel = columnIdToKanbanLevel(toColumnId);

        setItems((prev) =>
            prev.map((item) =>
                item.id === taskId ? { ...item, kanbanLevel: newKanbanLevel, isCompleted } : item
            )
        );

        const currentItem = items.find((i) => i.id === taskId);

        update_todo_item_api(taskId, {
            title: currentItem?.title,
            description: currentItem?.description,
            kanbanLevel: newKanbanLevel,
            isCompleted,
            priority: currentItem?.priority || "MEDIUM",
            image: currentItem?.image
        }).catch((err) => {
            console.error("Failed to move task:", err);
            // Optionally revert state here if needed
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

    const startEditTask = async (task: Task) => {
        // Need full DTO, find it in items
        const fullItem = items.find(i => i.id === task.id);
        if (fullItem) {
            setEditingTask(fullItem);
            setIsEditModalOpen(true);
        }
    };

    const handleSaveEditTask = async (taskId: number, data: {
        title: string;
        description: string;
        priority: string;
        deadline: string | null;
        image: string | null;
        kanbanLevel: string;
    }) => {
        const dto = await update_todo_item_api(taskId, data);

        // Update local state
        const tag = priorityToTag(dto.priority);
        let date: string | undefined;
        if (dto.deadline) {
            const d = new Date(dto.deadline);
            if (!Number.isNaN(d.getTime())) date = d.toLocaleDateString("sl-SI");
        }

        // Use data.image (what we sent) if server doesn't echo it back, or just fully trust dto if we are sure.
        // For safety/smoothness with large base64, using the one we have is often better if DTO is partial.
        // But assuming DTO is valid. The user reported image not rendering.
        // If server returns null for image but we sent it, we lose it.
        // Let's mix:
        const finalImage = (dto as any).image ?? data.image ?? undefined;

        // Merge with existing state to prevent data loss if API returns partial object
        setItems(prev => prev.map(i => i.id === taskId ? { ...i, ...dto, title: dto.title || i.title, image: finalImage || i.image || null } : i));
        setColumns(prev => prev.map(col => ({
            ...col,
            tasks: col.tasks.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        title: dto.title || t.title,
                        tag,
                        date,
                        image: finalImage || t.image
                    };
                }
                return t;
            })
        })));
    };

    // Focus state moved to parent

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

                                    <article
                                        className={
                                            "task_card" + (dragged && dragged.taskId === task.id ? " task_card--dragging" : "")
                                        }
                                        draggable
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
                                                    startEditTask(task);
                                                }}
                                                title="Uredi"
                                                aria-label="Uredi"
                                            >
                                                ⋯
                                            </button>
                                        </div>

                                        <div className="task_footer">
                                            <div className="task_footer_left">
                                                <span className={getTagClassName(task.tag)}>{getTagLabel(task.tag)}</span>
                                                {task.date && <span className="task_meta">{task.date}</span>}
                                            </div>

                                            <button
                                                type="button"
                                                className="task_focus_button"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const fullItem = items.find(i => i.id === task.id);
                                                    if (fullItem) onOpenFocus(fullItem);
                                                }}
                                                title="Fokus"
                                                aria-label="Fokus"
                                            >
                                                Fokus
                                            </button>
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

            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={closeEditForm}
                onSave={handleSaveEditTask}
                task={editingTask}
            />
        </div>
    );
}

export default Content;

import React, { useEffect, useRef, useState } from "react";
import "./EditTaskModal.css";
import type { TodoItemDTO } from "../../API/todo/todoItemAPI";

type EditTaskModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskId: number, data: {
        title: string;
        description: string;
        priority: string;
        deadline: string | null;
        image: string | null;
        kanbanLevel: string;
    }) => Promise<void>;
    task: TodoItemDTO | null;
};

export default function EditTaskModal({ isOpen, onClose, onSave, task }: EditTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [deadline, setDeadline] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && task) {
            setTitle(task.title);
            setDescription(task.description || "");
            setPriority(task.priority || "MEDIUM");
            // API returns ISO string or null. Date input expects YYYY-MM-DD
            if (task.deadline) {
                const d = new Date(task.deadline);
                if (!isNaN(d.getTime())) {
                    setDeadline(d.toISOString().split("T")[0]);
                } else {
                    setDeadline("");
                }
            } else {
                setDeadline("");
            }
            setImage(task.image ?? null);
        }
    }, [isOpen, task]);

    if (!isOpen || !task) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(task.id, {
                title,
                description,
                priority,
                deadline: deadline ? new Date(deadline).toISOString() : null,
                image,
                kanbanLevel: task.kanbanLevel
            });
            onClose();
        } catch (error) {
            console.error("Save failed", error);
            alert("Napaka pri shranjevanju.");
        } finally {
            setIsSaving(false);
        }
    };

    // Image handling logic
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Samo slike so dovoljene.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert("Slika je prevelika (max 2MB).");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    return (
        <div className="edit_modal_overlay" onClick={onClose}>
            <div className="edit_modal" onClick={e => e.stopPropagation()}>
                <div className="edit_modal_header">
                    <h3 className="edit_modal_title">Uredi opravilo</h3>
                    <button className="edit_modal_close" onClick={onClose}>&times;</button>
                </div>

                <div className="edit_modal_body">
                    <div className="form_group">
                        <label className="form_label">Naslov</label>
                        <input
                            type="text"
                            className="form_input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Kaj je treba narediti?"
                        />
                    </div>

                    <div className="form_group">
                        <label className="form_label">Opis</label>
                        <textarea
                            className="form_textarea"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Dodaj podrobnosti..."
                        />
                    </div>

                    <div className="form_row_split">
                        <div className="form_group">
                            <label className="form_label">Prioriteta</label>
                            <select
                                className="form_select"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                            >
                                <option value="LOW">Nizka</option>
                                <option value="MEDIUM">Srednja</option>
                                <option value="HIGH">Visoka</option>
                            </select>
                        </div>
                        <div className="form_group">
                            <label className="form_label">Rok (Deadline)</label>
                            <input
                                type="date"
                                className="form_input"
                                value={deadline}
                                onChange={e => setDeadline(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form_group">
                        <label className="form_label">Slika</label>
                        <div
                            className={`image_drop_area ${isDragActive ? 'active' : ''}`}
                            onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
                            onDragLeave={() => setIsDragActive(false)}
                            onDrop={handleDrop}
                        >
                            {!image ? (
                                <>
                                    <button
                                        type="button"
                                        className="image_upload_btn"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Izberi sliku
                                    </button>
                                    <div className="image_hint">ali povleci in spusti sem</div>
                                </>
                            ) : (
                                <div className="image_preview_container">
                                    <img src={image} alt="Preview" className="image_preview" />
                                    <button
                                        type="button"
                                        className="image_remove_btn"
                                        onClick={() => setImage(null)}
                                    >
                                        Odstrani
                                    </button>
                                </div>
                            )}
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="edit_modal_footer">
                    <button className="btn_cancel" onClick={onClose} disabled={isSaving}>Prekliči</button>
                    <button className="btn_save" onClick={handleSave} disabled={isSaving}>Shrani spremembe</button>
                </div>
            </div>
        </div>
    );
}

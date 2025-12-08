import React, { useState, useEffect } from "react";
import "./addTodoListModal.css";

export interface AddTodoListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { title: string; isShared: boolean }) => void;
}

const AddTodoListModal: React.FC<AddTodoListModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSave,
                                                           }) => {
    const [title, setTitle] = useState("");
    const [isShared, setIsShared] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle("");
            setIsShared(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            title: title.trim(),
            isShared,
        });
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="addTodoList-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="addTodoList-modal-title"
            onClick={handleBackdropClick}
        >
            <div className="addTodoList-modal-backdrop" />

            <div className="addTodoList-modal-dialog">
                <header className="addTodoList-modal-header">
                    <h2 id="addTodoList-modal-title">Dodaj seznam opravil</h2>
                    <button
                        type="button"
                        className="addTodoList-modal-close"
                        onClick={onClose}
                        aria-label="Zapri okno"
                    >
                        ×
                    </button>
                </header>

                <form className="addTodoList-modal-form" onSubmit={handleSubmit}>
                    <div className="addTodoList-modal-field">
                        <label htmlFor="addTodoList-title">
                            Naslov seznama opravil
                        </label>
                        <input
                            id="addTodoList-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="addTodoList-modal-field addTodoList-modal-field--switch">
                        <label
                            className="addTodoList-switch"
                            htmlFor="addTodoList-shared"
                        >
                            <div className="addTodoList-switch-text">
                                Kolaborativen seznam
                                <span className="addTodoList-switch-subtext">
                                    Omogoči deljenje in COLAB oznako
                                </span>
                            </div>

                            <div className="addTodoList-switch-control">
                                <input
                                    id="addTodoList-shared"
                                    type="checkbox"
                                    className="addTodoList-switch-input"
                                    checked={isShared}
                                    onChange={(e) =>
                                        setIsShared(e.target.checked)
                                    }
                                />
                                <span className="addTodoList-switch-slider" />
                            </div>
                        </label>
                    </div>

                    <footer className="addTodoList-modal-footer">
                        <button
                            type="button"
                            className="addTodoList-modal-button addTodoList-modal-button--ghost"
                            onClick={onClose}
                        >
                            Prekliči
                        </button>
                        <button
                            type="submit"
                            className="addTodoList-modal-button addTodoList-modal-button--primary"
                        >
                            Dodaj
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AddTodoListModal;
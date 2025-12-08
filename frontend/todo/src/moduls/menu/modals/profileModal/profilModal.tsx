import React, { useState, useEffect } from "react";
import "./profileModal.css";

interface ProfileModalProps {
    isOpen: boolean;
    initialUsername: string;
    initialEmail: string;
    onClose: () => void;
    onSave: (data: { username: string; email: string; password?: string }) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
                                                       isOpen,
                                                       initialUsername,
                                                       initialEmail,
                                                       onClose,
                                                       onSave,
                                                   }) => {
    const [username, setUsername] = useState(initialUsername);
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (isOpen) {
            setUsername(initialUsername);
            setEmail(initialEmail);
            setPassword("");
        }
    }, [isOpen, initialUsername, initialEmail]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSave({
            username: username.trim(),
            email: email.trim(),
            password: password.trim() || undefined,
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("logged_user");
        window.location.reload();
    };

    return (
        <div
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
        >
            <div className="profile-modal-backdrop" onClick={onClose} />

            <div className="profile-modal-dialog">
                <header className="profile-modal-header">
                    <h2 id="profile-modal-title">Urejanje profila</h2>
                    <button
                        type="button"
                        className="profile-modal-close"
                        onClick={onClose}
                        aria-label="Zapri okno"
                    >
                        ×
                    </button>
                </header>

                <form className="profile-modal-form" onSubmit={handleSubmit}>
                    <div className="profile-modal-field">
                        <label htmlFor="profile-username">Uporabniško ime</label>
                        <input
                            id="profile-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="profile-modal-field">
                        <label htmlFor="profile-email">Email</label>
                        <input
                            id="profile-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="profile-modal-field">
                        <label htmlFor="profile-password">Novo geslo</label>
                        <input
                            id="profile-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Pusti prazno, če ne želiš spremeniti"
                        />
                    </div>

                    <footer className="profile-modal-footer">
                        <p onClick={handleLogout} className={"odjava_pragraph"}>↩ Odjava</p>

                        <div>
                            <button type="button" className="profile-modal-button profile-modal-button--ghost" onClick={onClose}>
                                Prekliči
                            </button>
                            <button type="submit" className="profile-modal-button profile-modal-button--primary">
                                Shrani
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;

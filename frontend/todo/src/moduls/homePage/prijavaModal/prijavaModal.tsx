import "./prijavaModal.css";
import { openRegisterMOdal } from "../pricniModal/prikaziPricniModal.ts";
import { login_user_api } from "../../../API/user/userAPI.ts";
import { set_user_cache } from "../../../cache/userCache.ts";
import User from "../../../structures/user/user.ts";
import Role from "../../../structures/role.ts";
import type { FormEvent } from "react";

function PrijavaModal() {
    async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const username = (formData.get("username") ?? "") as string;
        const password = (formData.get("password") ?? "") as string;

        try {
            const user = await login_user_api(username, password);
            set_user_cache(new User(user.username, user.email, Role.REGULAR));

            window.location.href = "/app";
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            alert(msg);
        }
    }

    return (
        <div id="login-modal" className="modal" aria-hidden="true">
            <div className="modal-backdrop" data-close-modal></div>

            <div
                className="modal-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-title"
            >
                <button
                    type="button"
                    className="modal-close"
                    aria-label="Zapri"
                    data-close-modal
                >
                    ×
                </button>

                <div className="modal-body">
                    <div className="modal-pill">
                        <span>Sign in</span>
                    </div>

                    <h2 id="login-title" className="modal-title">
                        Prijava v RIS To-Do
                    </h2>
                    <p className="modal-subtitle">
                        Nadaljuj tam, kjer je tvoja ekipa ostala. Brezplačno in
                        open-source.
                    </p>

                    <form className="modal-form" onSubmit={handleFormSubmit}>
                        <label className="field">
                            <span>Username</span>
                            <input
                                type="text"
                                name="username"
                                autoComplete="username"
                                placeholder="username"
                                required
                            />
                        </label>

                        <label className="field">
                            <span>Geslo</span>
                            <input
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                required
                            />
                        </label>

                        <button type="submit" className="btn btn-primary modal-submit">
                            Prijava
                        </button>
                    </form>

                    <p className="modal-footer-text" onClick={openRegisterMOdal}>
                        Še nimaš računa? <a href="#">Ustvari račun</a> in se pridruži ekipi
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PrijavaModal;

import User from "../structures/user/user.ts";
import Role from "../structures/role.ts";

const STORAGE_KEY = "logged_user";

let logged_user: User | null = null;

(function initFromStorage() {
    if (typeof window === "undefined") return;

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const data = JSON.parse(raw);

        if (data && data.username && data.email && data.role !== undefined) {
            logged_user = new User(data.username, data.email, data.role as Role);
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
    }
})();

export function set_user_cache(user: User | null): void {
    logged_user = user;

    if (typeof window === "undefined") return;

    if (user) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({username: user.username, email: user.email, role: user.role,})
        );
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export function get_user_cache(): User | null {
    return logged_user;
}

export function get_username(): string | null {
    return logged_user?.username ?? null;
}

export function get_role(): Role | null {
    return logged_user?.role ?? null;
}

export function clear_user_cache(): void {
    set_user_cache(null);
}

export function is_logged_in(): boolean {
    return logged_user !== null;
}

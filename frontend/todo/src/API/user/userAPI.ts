const API_BASE = "http://localhost:8180/api/v1/api/users";

export async function register_user_api(
    username: string,
    email: string,
    pass: string
): Promise<{ username: string; email: string; role: string }> {
    const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: pass,
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Napaka pri registraciji");
    }

    const user = await res.json();
    console.log("Registriran user:", user);
    return user;
}

export async function login_user_api(
    username: string,
    password: string
): Promise<{ username: string; email: string; role: string }> {
    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Napaka pri prijavi");
    }

    return await res.json();
}

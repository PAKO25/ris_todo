const API_BASE = "http://localhost:8180/api/v1/lists";

export interface TodoListDTO {
    id: number;
    title: string;
    isShared: boolean;
    ownerEmail: string;
}

export async function create_todo_list_api(
    title: string,
    isShared: boolean,
    ownerEmail: string
): Promise<TodoListDTO> {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ownerEmail,
            title,
            isShared,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Napaka pri ustvarjanju seznama");
    }

    return await res.json();
}

export async function get_todo_lists_api(
    ownerEmail: string
): Promise<TodoListDTO[]> {
    const res = await fetch(
        `${API_BASE}?ownerEmail=${encodeURIComponent(ownerEmail)}`,
        {
            method: "GET",
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Napaka pri nalaganju seznamov");
    }

    return await res.json();
}
export default create_todo_list_api;

const API_BASE = "http://localhost:8180/api/v1/lists";

export interface TodoItemDTO {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    deadline: string | null;
    kanbanLevel: string;
    priority: string;
    image: string | null;
}

export async function get_todo_items_for_list(
    listId: number
): Promise<TodoItemDTO[]> {
    const res = await fetch(`${API_BASE}/${listId}/items`, {
        method: "GET",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Napaka pri nalaganju opravil");
    }

    return await res.json();
}

export async function create_todo_item_api(
    listId: number,
    data: {
        title: string;
        description?: string;
        deadline?: string | null;
        kanbanLevel: string;
        priority?: string;
        image?: string | null;
    }
): Promise<TodoItemDTO> {
    const res = await fetch(`${API_BASE}/${listId}/items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Napaka pri ustvarjanju opravila");
    }

    return await res.json();
}

export async function update_todo_item_api(
    itemId: number,
    data: {
        title?: string;
        description?: string;
        isCompleted?: boolean;
        deadline?: string | null;
        kanbanLevel?: string;
        priority?: string;
        image?: string | null;
    }
): Promise<TodoItemDTO> {
    // Map IN_PROGRESS to INPROGRESS for backend compatibility
    let level = data.kanbanLevel;
    if (level === "IN_PROGRESS") {
        level = "INPROGRESS";
    }

    const res = await fetch(`${API_BASE.replace('/lists', '/items')}/${itemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, kanbanLevel: level, name: data.title }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Napaka pri posodabljanju opravila");
    }

    const text = await res.text();
    const json = text ? JSON.parse(text) : {};

    // Ensure title is present (backend might return 'name' instead of 'title')
    if (json.name && !json.title) {
        json.title = json.name;
    }

    // Merge in case the server returns a partial object or empty response
    return {
        ...data,
        ...json,
        title: json.title || json.name || data.title
    } as TodoItemDTO;
}
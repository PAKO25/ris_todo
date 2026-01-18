import "./menu.css";
import "../../cache/userCache.ts";
import {
    get_username,
    get_role,
    get_user_cache,
} from "../../cache/userCache.ts";
import {
    get_user_todoListCache_all,
    set_user_todoListCache,
} from "../../cache/todoListCache.ts";
import SearchBar from "./searchbar/searchbar.tsx";
import ProfileModal from "./modals/profileModal/profilModal.tsx";
import AddTodoListModal from "./modals/addTodoListModal/addTodoListModal.tsx";
import { useEffect, useState } from "react";
import create_todo_list_api, {
    get_todo_lists_api,
    type TodoListDTO,
} from "../../API/todo/todoListAPI.ts";
import todoList from "../../structures/todoList/todoList.ts";

type MenuProps = {
    selectedListId: number | null;
    onSelectList: (id: number) => void;
};

function Menu({ selectedListId, onSelectList }: MenuProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAddTodoListOpen, setIsAddTodoListOpen] = useState(false);

    const user = get_user_cache();
    const username = get_username() || "";
    const email = user?.email || "";

    const handleOpenProfile = () => setIsProfileOpen(true);
    const handleCloseProfile = () => setIsProfileOpen(false);

    const handleSaveProfile = (data: {
        username: string;
        email: string;
        password?: string;
    }) => {
        console.log("Shranjujem profil:", data);
        // TODO: pokliči backend za update userja + posodobi userCache
        setIsProfileOpen(false);
    };

    function get_first_simbol(name: string): string {
        return name[0] || "";
    }

    function open_new_repo_popup(): void {
        setIsAddTodoListOpen(true);
    }

    const handleCloseAddTodoList = () => {
        setIsAddTodoListOpen(false);
    };

    const handleSaveAddTodoList = async (data: {
        title: string;
        isShared: boolean;
    }) => {
        if (!user) {
            alert("Najprej se prijavi.");
            return;
        }

        try {
            const apiList = await create_todo_list_api(
                data.title,
                data.isShared,
                user.email
            );
            console.log("API vrnil nov seznam:", apiList);

            const oldLists = get_user_todoListCache_all();
            const newList = new todoList(
                apiList.id,
                apiList.title,
                apiList.isShared,
                user
            );
            set_user_todoListCache([...oldLists, newList]);
        } catch (e: unknown) {
            console.error("Napaka pri dodajanju seznama:", e);
            alert(e || "Napaka pri dodajanju seznama");
        }

        setIsAddTodoListOpen(false);
    };

    function get_bage(isShared: boolean) {
        if (isShared) {
            return <div className="badge">COLAB</div>;
        }
        return <div></div>;
    }

    const handleSearch = (query: string) => {
        console.log("Searching for:", query);
    };

    function handleSelectList(id: number): void {
        onSelectList(id);
    }

    const [lists, setLists] = useState<todoList[]>(get_user_todoListCache_all());

    // ob mountu naložimo sezname iz backenda za prijavljenega userja
    useEffect(() => {
        if (!user) return;

        get_todo_lists_api(user.email)
            .then((apiLists: TodoListDTO[]) => {
                const fetchedLists = apiLists.map(
                    (l) => new todoList(l.id, l.title, l.isShared, user)
                );
                set_user_todoListCache(fetchedLists);
                setLists(fetchedLists);
            })
            .catch((e) => {
                console.error("Napaka pri nalaganju seznamov:", e);
            });
    }, [user?.email]);

    return (
        <>
            <div className="menu">
                <div className="user_name_container" onClick={handleOpenProfile}>
                    <div className="user_name_block">
                        {get_first_simbol(username)}
                    </div>
                    <div className="user_name_status_container">
                        <p className="user_name_text">{username}</p>
                        <p className="user_role_text">{get_role()}</p>
                    </div>
                </div>

                <div className="search_container">{/* placeholder */}</div>

                <div className="todo_repo_container">
                    <SearchBar onSearch={handleSearch} />
                    <div className="workspace_container">
                        <p className="workspace_text">Workspace</p>
                        <button
                            onClick={open_new_repo_popup}
                            className="add_workspace_button"
                        >
                            +
                        </button>
                    </div>
                    <div className="todo_repo_list">
                        {lists.map((item, index) => (
                            <div
                                key={item.id ?? index}
                                onClick={() => handleSelectList(item.id)}
                                className={
                                    "todo_list_title" +
                                    (item.id === selectedListId
                                        ? " todo_list_title--active"
                                        : "")
                                }
                            >
                                <p className="todo_list_title_text">
                                    {item.title}
                                </p>
                                {get_bage(item.isShared)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ProfileModal
                isOpen={isProfileOpen}
                initialUsername={username}
                initialEmail={email}
                onClose={handleCloseProfile}
                onSave={handleSaveProfile}
            />

            <AddTodoListModal
                isOpen={isAddTodoListOpen}
                onClose={handleCloseAddTodoList}
                onSave={handleSaveAddTodoList}
            />
        </>
    );
}

export default Menu;

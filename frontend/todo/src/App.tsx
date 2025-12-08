import "./App.css";
import Menu from "./moduls/menu/menu.tsx";
import Content from "./moduls/content/content.tsx";
import Homepage from "./moduls/homePage/homepage.tsx";

import { is_logged_in } from "./cache/userCache.ts";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

function BoardLayout() {
    const [selectedListId, setSelectedListId] = useState<number | null>(null);

    return (
        <div className="app">
            <Menu
                selectedListId={selectedListId}
                onSelectList={setSelectedListId}
            />
            <Content selectedListId={selectedListId} />
        </div>
    );
}

function App() {
    const show_menu_content: boolean = is_logged_in();

    return (
        <Routes>
            <Route
                path="/"
                element={show_menu_content ? <BoardLayout /> : <Homepage />}
            />
            <Route
                path="/app"
                element={
                    show_menu_content ? (
                        <BoardLayout />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;

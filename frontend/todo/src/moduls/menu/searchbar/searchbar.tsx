import "./searchbar.css"
import { useEffect, useState } from "react";

interface SearchBarProps {
    placeholder?: string;
    onSearch: (value: string) => void;
    delay?: number;
}

function SearchBar({
                       placeholder = "Search",
                       onSearch,
                       delay = 300,
                   }: SearchBarProps) {
    const [value, setValue] = useState("");

    useEffect(() => {
        const handle = window.setTimeout(() => {
            onSearch(value.trim());
        }, delay);

        return () => window.clearTimeout(handle);
    }, [value, delay, onSearch]);

    return (
        <div className="search-bar">

            <span className="search-bar__icon">⌕</span>

            <input
                type="text"
                className="search-bar__input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />

            {value && (
                <button
                    type="button"
                    className="search-bar__clear"
                    onClick={() => setValue("")}
                    aria-label="Počisti iskanje"
                >
                    ✕
                </button>
            )}
        </div>
    );
}

export default SearchBar;

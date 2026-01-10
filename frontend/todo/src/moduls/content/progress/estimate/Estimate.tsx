import { useMemo } from "react";
import "./estimate.css";
import type { TodoItemDTO } from "../../../../API/todo/todoItemAPI";
import { calculateEstimate, formatEstimate } from "./estimate";

type Props = {
    items: TodoItemDTO[];
};

export default function Estimate({ items }: Props) {
    const text = useMemo(() => {
        const result = calculateEstimate(items as any);
        return formatEstimate(result);
    }, [items]);

    const details = useMemo(() => {
        const result = calculateEstimate(items as any);
        if (!result.ok) return null;

        return `(${result.daysDecimal.toFixed(2)} dni • povp. ${result.avgTaskHours.toFixed(
            2
        )} h/task • odprtih ${result.openCount})`;
    }, [items]);

    if (import.meta.env.DEV) console.log("Estimate items:", items);

    return (
        <section className="estimate_card" aria-label="Estimate">
            <div className="estimate_left">
                <div className="estimate_title">Ocena dokončanja</div>
                <div className="estimate_value">{text}</div>
                {details && <div className="estimate_sub">{details}</div>}
            </div>
        </section>
    );

}

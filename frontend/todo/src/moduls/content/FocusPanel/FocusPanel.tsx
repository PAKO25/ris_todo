import { useEffect, useMemo, useState } from "react";
import "./FocusPanel.css";
import type {TodoItemDTO} from "../../../API/todo/todoItemAPI.ts";

type Segment = { kind: "work" | "break"; minutes: number; label: string };

function minutesForPriority(value?: string) {
    const v = (value ?? "").toLowerCase().trim();
    if (v === "high") return 480;
    if (v === "medium") return 240;
    if (v === "low") return 120;
    return 120;
}

function buildPomodoroPlan(totalMinutes: number): Segment[] {
    const WORK = 25;
    const SHORT = 5;
    const LONG = 15;

    const segments: Segment[] = [];
    let remaining = totalMinutes;
    let workCount = 0;

    while (remaining > 0) {
        const work = Math.min(WORK, remaining);
        segments.push({ kind: "work", minutes: work, label: "Fokus" });
        remaining -= work;
        workCount++;

        if (remaining <= 0) break;

        const isLong = workCount % 4 === 0;
        segments.push({
            kind: "break",
            minutes: isLong ? LONG : SHORT,
            label: isLong ? "Dolgi odmor" : "Kratek odmor",
        });
    }

    return segments;
}

function mmss(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FocusPanel({
                                       task,
                                       onClose,
                                   }: {
    task: TodoItemDTO;
    onClose: () => void;
}) {
    const priorityValue =
        (task as any).priority ?? (task as any).tag ?? (task as any).kanbanLevel;

    const totalMinutes = useMemo(
        () => minutesForPriority(priorityValue),
        [priorityValue]
    );

    const plan = useMemo(() => buildPomodoroPlan(totalMinutes), [totalMinutes]);

    const [running, setRunning] = useState(false);
    const [segmentIndex, setSegmentIndex] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(plan.length > 0 ? plan[0].minutes * 60 : 0);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRunning(false);
        setSegmentIndex(0);
        setSecondsLeft(plan.length > 0 ? plan[0].minutes * 60 : 0);
    }, [task.id, plan]);



    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
        if (!running) return;
        const t = window.setInterval(() => {
            setSecondsLeft((p) => (p > 0 ? p - 1 : 0));
        }, 1000);
        return () => window.clearInterval(t);
    }, [running]);

    useEffect(() => {
        if (!running) return;
        if (secondsLeft !== 0) return;

        const next = segmentIndex + 1;
        if (next >= plan.length) {
            setRunning(false);
            return;
        }
        setSegmentIndex(next);
        setSecondsLeft(plan[next].minutes * 60);
    }, [secondsLeft, running, segmentIndex, plan]);

    const seg = plan[segmentIndex];

    return (
        <div className="focus_overlay" onClick={onClose}>
            <aside className="focus_panel" onClick={(e) => e.stopPropagation()}>
                <header className="focus_topbar">
                    <button className="focus_back" onClick={onClose}>
                        ← Nazaj na board
                    </button>

                    <button
                        className="focus_start"
                        onClick={() => setRunning(true)}
                        disabled={running}
                        title={running ? "Timer teče" : "Začni"}
                    >
                        Start
                    </button>
                </header>

                <div className="focus_content">
                    <div className="focus_left">
                        <h2 className="focus_title">{task.title}</h2>

                        {task.description && (
                            <p className="focus_desc">{task.description}</p>
                        )}

                        {!task.description && (
                            <p className="focus_desc">Opravilo nima opisa</p>
                        )}

                        {task.image && (
                            <img className="focus_image" src={task.image} alt="Task" />
                        )}
                    </div>

                    <div className="focus_right">
                        <div className="pomodoro_card">
                            <div className="pomodoro_header">
                                <div className="pomodoro_label">
                                    {seg?.label} ({segmentIndex + 1}/{plan.length}) ·{" "}
                                    {seg?.kind === "work" ? "WORK" : "BREAK"}
                                </div>
                                <div className="pomodoro_time">{mmss(secondsLeft)}</div>
                            </div>

                            <div className="pomodoro_plan">
                                {plan.map((s, i) => (
                                    <div
                                        key={i}
                                        className={
                                            "pomodoro_row" + (i === segmentIndex ? " active" : "")
                                        }
                                    >
                                        <span className={"dot " + s.kind} />
                                        <span>{s.label}</span>
                                        <span className="mins">{s.minutes}m</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pomodoro_actions">
                                <button type="button" className="pomodoro_btn pomodoro_btn_done" onClick={onClose}>
                                    Done
                                </button>
                            </div>
                        </div>

                        <div className="focus_hint">ESC ali klik izven panela zapre.</div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

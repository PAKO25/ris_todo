import { useEffect, useMemo, useState } from "react";
import "./FocusPanel.css";
import type { TodoItemDTO } from "../../../API/todo/todoItemAPI.ts";

type Segment = { kind: "work" | "break"; minutes: number; label: string };

function minutesForPriority(value?: string) {
    const v = (value ?? "").toLowerCase().trim();
    if (v === "high") return 480;
    if (v === "medium") return 240;
    if (v === "low") return 120;
    return 120; // Default 2 hours
}

function buildPomodoroPlan(
    totalMinutes: number,
    focusMin: number,
    shortBreakMin: number,
    longBreakMin: number
): Segment[] {
    const segments: Segment[] = [];
    let remaining = totalMinutes;
    let workCount = 0;

    // Safety check to prevent infinite loops if user sets 0
    const safeFocus = Math.max(1, focusMin);

    while (remaining > 0) {
        // Work Block
        const work = Math.min(safeFocus, remaining);
        segments.push({ kind: "work", minutes: work, label: "Fokus" });
        remaining -= work;
        workCount++;

        if (remaining <= 0) break;

        // Break Block
        const isLong = workCount % 4 === 0;
        const breakTime = isLong ? longBreakMin : shortBreakMin;

        segments.push({
            kind: "break",
            minutes: breakTime,
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
    // --- State: Configuration ---
    const [focusDuration, setFocusDuration] = useState(25);
    const [shortBreakDuration, setShortBreakDuration] = useState(5);
    const [longBreakDuration, setLongBreakDuration] = useState(15);
    // Derived total minutes based on priority (initial guess)
    const initialTotalMinutes = useMemo(() => {
        const priorityValue =
            (task as any).priority ?? (task as any).tag ?? (task as any).kanbanLevel;
        return minutesForPriority(priorityValue);
    }, [task]);
    const [totalGoalMinutes, setTotalGoalMinutes] = useState(initialTotalMinutes);

    // --- State: Running ---
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [segmentIndex, setSegmentIndex] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(0);

    // --- Plan Generation ---
    const plan = useMemo(
        () =>
            buildPomodoroPlan(
                totalGoalMinutes,
                focusDuration,
                shortBreakDuration,
                longBreakDuration
            ),
        [totalGoalMinutes, focusDuration, shortBreakDuration, longBreakDuration]
    );

    // --- Timer Logic ---
    useEffect(() => {
        if (!isRunning || isPaused) return;

        const t = window.setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev > 0) return prev - 1;
                return 0;
            });
        }, 1000);
        return () => window.clearInterval(t);
    }, [isRunning, isPaused]);

    // --- Segment Transition ---
    useEffect(() => {
        if (!isRunning) return;
        if (secondsLeft === 0) {
            // Check if we just finished a segment
            const next = segmentIndex + 1;
            if (next < plan.length) {
                setSegmentIndex(next);
                setSecondsLeft(plan[next].minutes * 60);
                // Optional: Auto-pause between segments? For now, let's keep running or pause on breaks if desired.
                // Commonly users want audio notification here.
            } else {
                // Done
                setIsPaused(true); // Stop timer at end
            }
        }
    }, [secondsLeft, isRunning, segmentIndex, plan]);

    // --- Handlers ---
    const handleStart = () => {
        if (plan.length > 0) {
            setSegmentIndex(0);
            setSecondsLeft(plan[0].minutes * 60);
            setIsRunning(true);
            setIsPaused(false);
        }
    };

    const handleStop = () => {
        setIsRunning(false);
        setIsPaused(false);
        setSegmentIndex(0);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const currentSegment = plan[segmentIndex];
    const progressPercent = currentSegment
        ? 100 - (secondsLeft / (currentSegment.minutes * 60)) * 100
        : 0;

    // --- Render Helpers ---

    // SETUP VIEW
    const renderSetup = () => (
        <div className="focus_setup_container fade_in">
            <div className="focus_setup_left">
                <div className="focus_header_large">
                    <h1>{task.title}</h1>
                    {task.description && <p className="subtitle">{task.description}</p>}
                </div>

                {task.image && (
                    <img className="focus_hero_image" src={task.image} alt="Task Hero" />
                )}

                <div className="setup_actions">
                    <button className="btn_primary_large" onClick={handleStart}>
                        Začni Fokus
                        <span className="icon_arrow">→</span>
                    </button>
                    <button className="btn_secondary_large" onClick={onClose}>
                        Prekliči
                    </button>
                </div>
            </div>

            <div className="focus_setup_right">
                <div className="setup_card">
                    <h2>Konfiguracija</h2>

                    <div className="control_group">
                        <label>Čas fokusa (min)</label>
                        <div className="range_wrapper">
                            <input
                                type="range" min="5" max="60" step="5"
                                value={focusDuration}
                                onChange={e => setFocusDuration(Number(e.target.value))}
                            />
                            <span className="val_badge">{focusDuration}m</span>
                        </div>
                    </div>

                    <div className="control_group">
                        <label>Kratek odmor (min)</label>
                        <div className="range_wrapper">
                            <input
                                type="range" min="1" max="15" step="1"
                                value={shortBreakDuration}
                                onChange={e => setShortBreakDuration(Number(e.target.value))}
                            />
                            <span className="val_badge">{shortBreakDuration}m</span>
                        </div>
                    </div>

                    <div className="control_group">
                        <label>Dolgi odmor (min)</label>
                        <div className="range_wrapper">
                            <input
                                type="range" min="10" max="45" step="5"
                                value={longBreakDuration}
                                onChange={e => setLongBreakDuration(Number(e.target.value))}
                            />
                            <span className="val_badge">{longBreakDuration}m</span>
                        </div>
                    </div>

                    <div className="control_group">
                        <label>Cilj skupnega dela (min)</label>
                        <div className="range_wrapper">
                            <input
                                type="range" min="30" max="480" step="30"
                                value={totalGoalMinutes}
                                onChange={e => setTotalGoalMinutes(Number(e.target.value))}
                            />
                            <span className="val_badge">{Math.floor(totalGoalMinutes / 60)}h {totalGoalMinutes % 60}m</span>
                        </div>
                    </div>

                    <div className="plan_preview">
                        <h3>Predogled: {plan.length} segmentov</h3>
                        <div className="mini_plan_list">
                            {plan.slice(0, 5).map((s, i) => (
                                <div key={i} className={`mini_dot ${s.kind}`} title={s.label} />
                            ))}
                            {plan.length > 5 && <span className="mini_more">+{plan.length - 5}</span>}
                        </div>
                        <div className="total_duration_est">
                            Skupaj cca: {Math.floor((plan.reduce((a, b) => a + b.minutes, 0)) / 60)}h {(plan.reduce((a, b) => a + b.minutes, 0)) % 60}m
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // RUNNING VIEW
    const renderRunning = () => (
        <div className="focus_running_container slide_up">
            {task.image && (
                <div className="running_hero_bg" style={{ backgroundImage: `url("${task.image}")` }} />
            )}
            <div className="running_header">
                <button className="btn_ghost" onClick={handleStop}>← Končaj</button>
                <div className="spacer"></div>
            </div>

            <div className="running_main">
                <div className="running_task_details">
                    <div className="running_task_info_card">
                        <h3>{task.title}</h3>
                        {task.description && <p>{task.description}</p>}

                        {task.image && (
                            <div className="running_task_image_container">
                                <img src={task.image} alt="Task" className="running_task_image" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="timer_circle_container">
                    {/* A simple visual representation of progress */}
                    <svg className="progress_ring" width="300" height="300">
                        <circle
                            className="progress_ring_circle_bg"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                            fill="transparent"
                            r="140"
                            cx="150"
                            cy="150"
                        />
                        <circle
                            className={`progress_ring_circle ${currentSegment?.kind}`}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            r="140"
                            cx="150"
                            cy="150"
                            style={{
                                strokeDasharray: `${2 * Math.PI * 140}`,
                                strokeDashoffset: `${(2 * Math.PI * 140) * (1 - progressPercent / 100)}`,
                                transition: 'stroke-dashoffset 1s linear'
                            }}
                        />
                    </svg>
                    <div className="timer_display">
                        <div className="timer_label">{currentSegment?.label}</div>
                        <div className="timer_value">{mmss(secondsLeft)}</div>
                        <div className="timer_controls">
                            <button className="btn_circle" onClick={togglePause}>
                                {isPaused ? "▶" : "⏸"}
                            </button>
                            <button className="btn_circle secondary" onClick={() => {
                                // Skip
                                const next = segmentIndex + 1;
                                if (next < plan.length) {
                                    setSegmentIndex(next);
                                    setSecondsLeft(plan[next].minutes * 60);
                                } else {
                                    handleStop();
                                }
                            }}>⏭</button>
                        </div>
                    </div>
                </div>

                <div className="plan_timeline">
                    <h3>Potek dela</h3>
                    <div className="timeline_scroller">
                        {plan.map((s, i) => {
                            const isActive = i === segmentIndex;
                            const isPast = i < segmentIndex;
                            return (
                                <div
                                    key={i}
                                    className={`timeline_item ${s.kind} ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                                >
                                    <div className="timeline_time">{s.minutes}m</div>
                                    <div className="timeline_dot_line">
                                        <div className="timeline_dot"></div>
                                        {i < plan.length - 1 && <div className="timeline_line"></div>}
                                    </div>
                                    <div className="timeline_content">
                                        <span className="timeline_label">{s.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="focus_overlay">
            {!isRunning ? renderSetup() : renderRunning()}
        </div>
    );
}

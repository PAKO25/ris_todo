import { useMemo } from "react";
import "./progress.css";

type ProgressColumn = {
    id: string;
    tasks: unknown[];
};

type ProgressProps = {
    columns: ProgressColumn[];
};

function Progress({ columns }: ProgressProps) {
    const { total, done, percent } = useMemo(() => {
        const totalTasks = columns.reduce((acc, c) => acc + (c.tasks?.length ?? 0), 0);
        const doneTasks = (columns.find((c) => c.id === "done")?.tasks?.length ?? 0);

        const p = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
        return { total: totalTasks, done: doneTasks, percent: p };
    }, [columns]);

    return (
        <section className="progress_card" aria-label="Progress">
            <div className="progress_top">
                <div className="progress_title_wrap">
                    <span className="progress_title">Progress</span>
                    <span className="progress_meta">
                        {done}/{total}
                    </span>
                </div>
                <span className="progress_percent">{percent}%</span>
            </div>

            <div className="progress_track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress_fill" style={{ width: `${percent}%` }} />
            </div>
        </section>
    );
}

export default Progress;

export type AnyTodoItem = Record<string, any>;

export function isDone(item: AnyTodoItem): boolean {
    return item?.done === true || item?.isDone === true || item?.completed === true;
}

function getStartIso(item: AnyTodoItem): string | null {
    return item?.startedAt ?? item?.createdAt ?? null;
}

function getEndIso(item: AnyTodoItem): string | null {
    return item?.doneAt ?? item?.completedAt ?? item?.updatedAt ?? null;
}


export function getDoneDurationHours(item: AnyTodoItem): number | null {
    if (!isDone(item)) return null;

    const startIso = getStartIso(item);
    const endIso = getEndIso(item);

    if (!startIso || !endIso) return null;

    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    if (end <= start) return null;

    return (end - start) / (1000 * 60 * 60);
}

export function collectEstimateInputs(items: AnyTodoItem[]) {
    const doneItems = items.filter(isDone);
    const openItems = items.filter((x) => !isDone(x));

    const durations = doneItems
        .map(getDoneDurationHours)
        .filter((x): x is number => x !== null);

    return {
        doneCount: doneItems.length,
        openCount: openItems.length,
        durationsHours: durations,
    };
}

export type EstimateResult =
    | {
    ok: true;
    avgTaskHours: number;
    openCount: number;
    totalHours: number;
    daysWhole: number;
    hoursModulo8: number;
    daysDecimal: number;
}
    | {
    ok: false;
    reason: "NO_DONE_DATA" | "NO_OPEN_TASKS";
    openCount: number;
};

export function calculateEstimate(items: AnyTodoItem[]): EstimateResult {
    const { openCount, durationsHours } = collectEstimateInputs(items);

    if (openCount === 0) {
        return { ok: false, reason: "NO_OPEN_TASKS", openCount };
    }

    if (durationsHours.length === 0) {
        return { ok: false, reason: "NO_DONE_DATA", openCount };
    }

    const avgTaskHours = durationsHours.reduce((s, x) => s + x, 0) / durationsHours.length;

    const totalHours = avgTaskHours * openCount;

    const daysDecimal = totalHours / 8;
    const daysWhole = Math.floor(totalHours / 8);
    const hoursModulo8 = Math.floor(totalHours % 8);

    return {
        ok: true,
        avgTaskHours,
        openCount,
        totalHours,
        daysWhole,
        hoursModulo8,
        daysDecimal,
    };
}

export function formatEstimate(result: EstimateResult): string {
    if (!result.ok) {
        if (result.reason === "NO_OPEN_TASKS") return "0 dni 0 ur";
        return "Ni dovolj podatkov (ni dokončanih nalog).";
    }
    return `${result.daysWhole} dni ${result.hoursModulo8} ur`;
}

export type AnyTodoItem = Record<string, any>;

export function isDone(item: AnyTodoItem): boolean {
    return item?.done === true || item?.isDone === true || item?.completed === true || item?.isCompleted === true;
}


function getEstimatedDuration(item: AnyTodoItem): number {
    const p = (item.priority || "").toUpperCase();
    if (p === "HIGH") return 8;
    if (p === "LOW") return 2;
    return 4; // Medium or default
}

export function collectEstimateInputs(items: AnyTodoItem[]) {
    const openItems = items.filter((x) => !isDone(x));

    const totalHours = openItems.reduce((sum, item) => sum + getEstimatedDuration(item), 0);
    const avgTaskHours = openItems.length > 0 ? totalHours / openItems.length : 0;

    return {
        openCount: openItems.length,
        totalHours,
        avgTaskHours
    };
}

export type EstimateResult =
    | {
        ok: true;
        openCount: number;
        totalHours: number;
        daysWhole: number;
        hoursModulo8: number;
        daysDecimal: number;
        avgTaskHours: number;
    }
    | {
        ok: false;
        reason: "NO_OPEN_TASKS";
        openCount: number;
    };

export function calculateEstimate(items: AnyTodoItem[]): EstimateResult {
    const { openCount, totalHours, avgTaskHours } = collectEstimateInputs(items);

    if (openCount === 0) {
        return { ok: false, reason: "NO_OPEN_TASKS", openCount };
    }

    const daysDecimal = totalHours / 8;
    const daysWhole = Math.floor(daysDecimal);
    const hoursModulo8 = Math.round((daysDecimal - daysWhole) * 8);

    return {
        ok: true,
        openCount,
        totalHours,
        daysWhole,
        hoursModulo8,
        daysDecimal,
        avgTaskHours
    };
}

export function formatEstimate(result: EstimateResult): string {
    if (!result.ok) {
        if (result.reason === "NO_OPEN_TASKS") return "0 dni 0 ur";
        return "Ni dovolj podatkov.";
    }
    return `${result.daysWhole} dni ${result.hoursModulo8} ur`;
}

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

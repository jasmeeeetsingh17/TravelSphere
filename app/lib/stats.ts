import dayjs from "dayjs";

/** The last `n` calendar months, oldest first. */
export const lastMonths = (n: number) =>
    Array.from({ length: n }, (_, i) => dayjs().startOf("month").subtract(n - 1 - i, "month"));

export const monthLabel = (m: dayjs.Dayjs, withYear = false) => m.format(withYear ? "MMM YY" : "MMM");

type Dated = { date: string; value?: number };

/** Sums `value` (or counts items when there is no value) per month. */
export const bucket = (items: Dated[], months: dayjs.Dayjs[]) =>
    months.map((m) =>
        items.reduce((sum, it) => (it.date && dayjs(it.date).isSame(m, "month") ? sum + (it.value ?? 1) : sum), 0)
    );

/** This month versus last month, for trend badges. */
export const thisVsLast = (items: Dated[]) => {
    const [last, current] = bucket(items, lastMonths(2));
    return { current, last };
};

export const pctChange = (current: number, last: number) =>
    last === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - last) / last) * 100);

import type { TripView } from "~/lib/trip-view";
import { priceToNumber } from "~/lib/utils";

/**
 * Trips do not store their real costs, so profit is estimated from the price with a
 * typical travel-agency margin for each budget level. Change these numbers to match
 * your real margins and every analytics chart follows.
 */
export const MARGINS: Record<string, number> = {
    Budget: 0.12,
    "Mid-range": 0.18,
    Luxury: 0.25,
    Premium: 0.3,
};
const DEFAULT_MARGIN = 0.18;

export type TripProfit = {
    id: string;
    name: string;
    state: string;
    style: string;
    budget: string;
    group: string;
    days: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    profitPerDay: number;
    /** 0-100, relative to the other trips (profit per day counts most, then total profit) */
    score: number;
    verdict: "Make more" | "Good" | "Review";
};

export const tripProfit = (t: TripView): Omit<TripProfit, "score" | "verdict"> => {
    const revenue = priceToNumber(t.price);
    const margin = MARGINS[t.budget ?? ""] ?? DEFAULT_MARGIN;
    const profit = Math.round(revenue * margin);
    const days = t.dayCount || 1;
    return {
        id: t.id,
        name: t.name,
        state: t.state || t.location.split(",").pop()?.trim() || "Other",
        style: t.style || "Other",
        budget: t.budget || "Other",
        group: t.group || "Other",
        days,
        revenue,
        cost: revenue - profit,
        profit,
        margin,
        profitPerDay: Math.round(profit / days),
    };
};

/** Every trip with its estimated profit and a score, best first. */
export const rankTrips = (trips: TripView[]): TripProfit[] => {
    const rows = trips.map(tripProfit).filter((r) => r.revenue > 0);
    const maxPerDay = Math.max(1, ...rows.map((r) => r.profitPerDay));
    const maxProfit = Math.max(1, ...rows.map((r) => r.profit));

    return rows
        .map((r) => {
            const score = Math.round((r.profitPerDay / maxPerDay) * 70 + (r.profit / maxProfit) * 30);
            const verdict: TripProfit["verdict"] = score >= 66 ? "Make more" : score >= 33 ? "Good" : "Review";
            return { ...r, score, verdict };
        })
        .sort((a, b) => b.score - a.score);
};

export type Recommendation = {
    label: string;
    style: string;
    budget: string;
    state: string;
    trips: number;
    avgProfit: number;
    avgProfitPerDay: number;
};

/**
 * Groups trips by style + budget + state and returns the most profitable kinds,
 * so the admin knows which trips to create more of.
 */
export const recommend = (rows: TripProfit[], limit = 3): Recommendation[] => {
    const groups = new Map<string, TripProfit[]>();
    for (const r of rows) {
        const key = `${r.style}|${r.budget}|${r.state}`;
        groups.set(key, [...(groups.get(key) ?? []), r]);
    }

    return [...groups.entries()]
        .map(([key, list]) => {
            const [style, budget, state] = key.split("|");
            const avg = (f: (r: TripProfit) => number) => Math.round(list.reduce((s, r) => s + f(r), 0) / list.length);
            return {
                label: `${style} · ${budget} trips in ${state}`,
                style,
                budget,
                state,
                trips: list.length,
                avgProfit: avg((r) => r.profit),
                avgProfitPerDay: avg((r) => r.profitPerDay),
            };
        })
        .sort((a, b) => b.avgProfitPerDay - a.avgProfitPerDay)
        .slice(0, limit);
};

/** Average profit per day for each value of a field (style, budget, state...). */
export const profitBy = (rows: TripProfit[], key: (r: TripProfit) => string) =>
    Object.entries(
        rows.reduce<Record<string, { sum: number; n: number }>>((acc, r) => {
            const k = key(r);
            acc[k] = { sum: (acc[k]?.sum ?? 0) + r.profit, n: (acc[k]?.n ?? 0) + 1 };
            return acc;
        }, {})
    )
        .map(([x, { sum, n }]) => ({ x, y: Math.round(sum / n), trips: n }))
        .sort((a, b) => b.y - a.y);

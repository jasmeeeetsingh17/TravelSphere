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
    /** Price of one booking */
    price: number;
    margin: number;
    /** Profit from one booking */
    unitProfit: number;
    /** Profit from one booking, per day of the trip */
    profitPerDay: number;
    /** People who booked (entered by an admin) */
    bookings: number;
    /** Money taken so far: price × bookings */
    revenue: number;
    /** Cost of those bookings */
    cost: number;
    /** Profit earned so far: unitProfit × bookings */
    profit: number;
    /** 0-100, relative to the other trips */
    score: number;
    verdict: "Make more" | "Good" | "Review";
};

type Base = Omit<TripProfit, "score" | "verdict">;

export const tripProfit = (t: TripView): Base => {
    const price = priceToNumber(t.price);
    const margin = MARGINS[t.budget ?? ""] ?? DEFAULT_MARGIN;
    const unitProfit = Math.round(price * margin);
    const days = t.dayCount || 1;
    const bookings = t.bookings || 0;
    return {
        id: t.id,
        name: t.name,
        state: t.state || t.location.split(",").pop()?.trim() || "Other",
        style: t.style || "Other",
        budget: t.budget || "Other",
        group: t.group || "Other",
        days,
        price,
        margin,
        unitProfit,
        profitPerDay: Math.round(unitProfit / days),
        bookings,
        revenue: price * bookings,
        cost: (price - unitProfit) * bookings,
        profit: unitProfit * bookings,
    };
};

/**
 * Every priced trip with a score, best first.
 * The score mixes how many people booked (40%), the profit earned so far (35%) and how
 * profitable each booking is per day (25%), so proven demand counts most. When no bookings
 * are entered yet, only profit per day counts. It is scaled so the best trip scores 100.
 */
export const rankTrips = (trips: TripView[]): TripProfit[] => {
    const rows = trips.map(tripProfit).filter((r) => r.price > 0);
    const max = (f: (r: Base) => number) => Math.max(1, ...rows.map(f));
    const maxPerDay = max((r) => r.profitPerDay);
    const maxBookings = max((r) => r.bookings);
    const maxProfit = max((r) => r.profit);

    const raw = rows.map((r) => ({
        r,
        s: (r.bookings / maxBookings) * 40 + (r.profit / maxProfit) * 35 + (r.profitPerDay / maxPerDay) * 25,
    }));
    const top = Math.max(1, ...raw.map((x) => x.s));

    return raw
        .map(({ r, s }) => {
            const score = Math.round((s / top) * 100);
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
    bookings: number;
    avgProfit: number;
    avgProfitPerDay: number;
    score: number;
};

/**
 * Groups trips by style + budget + state and returns the strongest kinds of trip
 * (by average score), so the admin knows what to create more of.
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
                bookings: list.reduce((s, r) => s + r.bookings, 0),
                avgProfit: avg((r) => r.unitProfit),
                avgProfitPerDay: avg((r) => r.profitPerDay),
                score: avg((r) => r.score),
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

/** Average profit per booking for each value of a field (style, budget, state...). */
export const profitBy = (rows: TripProfit[], key: (r: TripProfit) => string) =>
    Object.entries(
        rows.reduce<Record<string, { sum: number; n: number }>>((acc, r) => {
            const k = key(r);
            acc[k] = { sum: (acc[k]?.sum ?? 0) + r.unitProfit, n: (acc[k]?.n ?? 0) + 1 };
            return acc;
        }, {})
    )
        .map(([x, { sum, n }]) => ({ x, y: Math.round(sum / n), trips: n }))
        .sort((a, b) => b.y - a.y);

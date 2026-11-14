import { useMemo, useState } from "react";
import { Link } from "react-router";
import dayjs from "dayjs";
import { ArrowDownWideNarrow, Eye, LayoutGrid, List, MapPin, Pencil, Plus, Search, Users, X } from "lucide-react";
import { TripCard } from "../../../components";
import { loadBookings } from "~/appwrite/admin";
import { getSavedTrips } from "~/appwrite/trips";
import { withBookingStats } from "~/lib/booking";
import { cn, money, priceToNumber } from "~/lib/utils";
import type { Route } from "./+types/trips";

export const meta = () => [{ title: "Trips | TravelSphere Admin" }];

export const clientLoader = async () => {
    const [trips, { bookings }] = await Promise.all([getSavedTrips(200), loadBookings()]);
    return withBookingStats(trips, bookings);
};

const SORTS = {
    newest: "Newest first",
    booked: "Most booked",
    priceLow: "Price: low to high",
    priceHigh: "Price: high to low",
    name: "Name A-Z",
} as const;
type Sort = keyof typeof SORTS;
const PAGE = 12;

const control = "h-11 rounded-xl border border-light-400 bg-white px-3 text-sm text-dark-100 outline-none focus:border-primary-100 focus:ring-2 focus:ring-primary-100/15";
const uniq = (list: (string | undefined)[]) => [...new Set(list.filter(Boolean) as string[])].sort();

const Trips = ({ loaderData: trips }: Route.ComponentProps) => {
    const [query, setQuery] = useState("");
    const [state, setState] = useState("");
    const [style, setStyle] = useState("");
    const [budget, setBudget] = useState("");
    const [sort, setSort] = useState<Sort>("newest");
    const [view, setView] = useState<"grid" | "list">("grid");
    const [shown, setShown] = useState(PAGE);

    const options = useMemo(() => ({ states: uniq(trips.map((t) => t.state)), styles: uniq(trips.map((t) => t.style)), budgets: uniq(trips.map((t) => t.budget)) }), [trips]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = trips.filter(
            (t) =>
                (!state || t.state === state) &&
                (!style || t.style === style) &&
                (!budget || t.budget === budget) &&
                (!q || [t.name, t.location, ...(t.interests ?? []), ...t.tags].join(" ").toLowerCase().includes(q))
        );
        const by: Record<Sort, (a: (typeof list)[number], b: (typeof list)[number]) => number> = {
            newest: (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
            booked: (a, b) => b.bookings - a.bookings,
            priceLow: (a, b) => priceToNumber(a.price) - priceToNumber(b.price),
            priceHigh: (a, b) => priceToNumber(b.price) - priceToNumber(a.price),
            name: (a, b) => a.name.localeCompare(b.name),
        };
        return [...list].sort(by[sort]);
    }, [trips, query, state, style, budget, sort]);

    const filtering = Boolean(query || state || style || budget);
    const clear = () => {
        setQuery("");
        setState("");
        setStyle("");
        setBudget("");
        setShown(PAGE);
    };
    const visible = filtered.slice(0, shown);

    const prices = trips.map((t) => priceToNumber(t.price)).filter(Boolean);
    const stats = [
        ["Trips", trips.length],
        ["States covered", options.states.length],
        ["People booked", trips.reduce((s, t) => s + t.bookings, 0).toLocaleString("en-IN")],
        ["Average price", prices.length ? money(prices.reduce((a, b) => a + b, 0) / prices.length) : "-"],
    ] as const;

    return (
        <main className="dashboard wrapper">
            {/* Title + action */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <span className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-100">Trips</h1>
                    <p className="text-sm text-gray-100">Every itinerary in your database. Open one to see, edit or delete it.</p>
                </span>
                <Link to="/trips/create" className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold px-5 shadow-md shadow-primary-100/30 transition-colors shrink-0">
                    <Plus size={16} /> Create trip
                </Link>
            </div>

            {/* Summary */}
            <ul className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-2xl border border-light-400 divide-x divide-y md:divide-y-0 divide-light-400 overflow-hidden">
                {stats.map(([label, value]) => (
                    <li key={label} className="px-5 py-4 flex flex-col gap-0.5">
                        <small className="text-xs text-gray-100">{label}</small>
                        <strong className="text-xl font-bold text-dark-100 tabular-nums">{value}</strong>
                    </li>
                ))}
            </ul>

            {/* Toolbar */}
            <section className="bg-white rounded-2xl border border-light-400 p-3 md:p-4 flex flex-col gap-3">
                <div className="flex flex-col lg:flex-row gap-3">
                    <span className="relative flex-1">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-100" />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShown(PAGE);
                            }}
                            placeholder="Search by name, place or interest"
                            aria-label="Search trips"
                            className={cn(control, "w-full pl-10")}
                        />
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">
                        {(
                            [
                                ["All states", state, setState, options.states],
                                ["All styles", style, setStyle, options.styles],
                                ["All budgets", budget, setBudget, options.budgets],
                            ] as const
                        ).map(([label, value, set, list]) => (
                            <select
                                key={label}
                                value={value}
                                onChange={(e) => {
                                    set(e.target.value);
                                    setShown(PAGE);
                                }}
                                aria-label={label}
                                className={cn(control, "cursor-pointer lg:w-40", value && "border-primary-100 text-primary-100 font-semibold")}
                            >
                                <option value="">{label}</option>
                                {list.map((o) => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </select>
                        ))}
                        <label className="relative">
                            <ArrowDownWideNarrow size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-100 pointer-events-none" />
                            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort trips" className={cn(control, "w-full pl-9 cursor-pointer lg:w-48")}>
                                {Object.entries(SORTS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-3 text-sm text-gray-100">
                        Showing <strong className="text-dark-100">{filtered.length}</strong> of {trips.length}
                        {filtering && (
                            <button onClick={clear} className="flex items-center gap-1 text-xs font-semibold text-primary-100 hover:underline cursor-pointer">
                                <X size={13} /> Clear filters
                            </button>
                        )}
                    </span>
                    <span className="flex rounded-xl bg-light-200 p-1" role="tablist" aria-label="View">
                        {(
                            [
                                ["grid", LayoutGrid],
                                ["list", List],
                            ] as const
                        ).map(([v, Icon]) => (
                            <button
                                key={v}
                                role="tab"
                                aria-selected={view === v}
                                aria-label={`${v} view`}
                                onClick={() => setView(v)}
                                className={cn("size-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer", view === v ? "bg-white text-primary-100 shadow" : "text-gray-100 hover:text-dark-100")}
                            >
                                <Icon size={16} />
                            </button>
                        ))}
                    </span>
                </div>
            </section>

            {/* Results */}
            {!visible.length ? (
                <div className="flex flex-col items-center gap-3 text-center bg-white rounded-2xl border border-dashed border-light-400 py-16">
                    <p className="text-gray-100">{trips.length ? "No trips match these filters." : "There are no trips yet."}</p>
                    {trips.length ? (
                        <button onClick={clear} className="text-sm font-semibold text-primary-100 hover:underline cursor-pointer">Clear filters</button>
                    ) : (
                        <Link to="/trips/create" className="flex items-center gap-2 bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-5 py-2.5">
                            <Plus size={16} /> Create the first trip
                        </Link>
                    )}
                </div>
            ) : view === "grid" ? (
                <div className="trip-grid">
                    {visible.map((t) => (
                        <TripCard key={t.id} id={t.id} name={t.name} imageUrl={t.imageUrl} location={t.location} tags={t.tags} price={t.price} bookings={t.bookings} href={`/trips/${t.id}`} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-light-400 overflow-x-auto">
                    <table className="w-full min-w-[820px] text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-gray-100 border-b border-light-400">
                                <th className="py-3 px-4 font-semibold">Trip</th>
                                <th className="py-3 px-3 font-semibold">Style</th>
                                <th className="py-3 px-3 font-semibold">Budget</th>
                                <th className="py-3 px-3 font-semibold text-right">Days</th>
                                <th className="py-3 px-3 font-semibold text-right">Price</th>
                                <th className="py-3 px-3 font-semibold text-right">Booked</th>
                                <th className="py-3 px-3 font-semibold">Added</th>
                                <th className="py-3 px-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-400">
                            {visible.map((t) => (
                                <tr key={t.id} className="hover:bg-light-200/60">
                                    <td className="py-3 px-4">
                                        <Link to={`/trips/${t.id}`} className="flex items-center gap-3 group">
                                            <img src={t.imageUrl} alt="" className="size-11 rounded-xl object-cover shrink-0" />
                                            <span className="min-w-0 flex flex-col leading-tight">
                                                <strong className="text-dark-100 truncate group-hover:text-primary-100">{t.name}</strong>
                                                <small className="flex items-center gap-1 text-xs text-gray-100 truncate"><MapPin size={12} /> {t.location}</small>
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="py-3 px-3 text-dark-100">{t.style ?? "-"}</td>
                                    <td className="py-3 px-3 text-dark-100">{t.budget ?? "-"}</td>
                                    <td className="py-3 px-3 text-right tabular-nums text-dark-100">{t.dayCount}</td>
                                    <td className="py-3 px-3 text-right tabular-nums font-semibold text-dark-100">{t.price || "-"}</td>
                                    <td className="py-3 px-3 text-right">
                                        <span className="inline-flex items-center gap-1 tabular-nums text-dark-100"><Users size={13} className="text-gray-100" /> {t.bookings}</span>
                                    </td>
                                    <td className="py-3 px-3 whitespace-nowrap text-gray-100">{t.createdAt ? dayjs(t.createdAt).format("D MMM YYYY") : "-"}</td>
                                    <td className="py-3 px-4">
                                        <span className="flex justify-end gap-1">
                                            <Link to={`/trips/${t.id}`} title="View" className="size-8 rounded-lg flex items-center justify-center text-gray-100 hover:bg-primary-50 hover:text-primary-100">
                                                <Eye size={16} />
                                            </Link>
                                            <Link to={`/trips/${t.id}/edit`} title="Edit" className="size-8 rounded-lg flex items-center justify-center text-gray-100 hover:bg-primary-50 hover:text-primary-100">
                                                <Pencil size={15} />
                                            </Link>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filtered.length > shown && (
                <button
                    onClick={() => setShown((n) => n + PAGE)}
                    className="self-center h-11 px-6 rounded-xl border border-light-400 bg-white text-sm font-semibold text-dark-100 hover:border-primary-100 hover:text-primary-100 transition-colors cursor-pointer"
                >
                    Load more ({filtered.length - shown} left)
                </button>
            )}
        </main>
    );
};

export default Trips;

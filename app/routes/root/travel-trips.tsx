import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowDownWideNarrow, Search, SearchX, Sparkles, X } from "lucide-react";
import { TripCard } from "../../../components";
import { budgetOptions as BUDGETS, fitsLength, TRIP_LENGTHS as LENGTHS, travellerGroups as GROUPS, type TripLength as Length } from "~/constants";
import { dummyTrips } from "~/constants/dummyTrips";
import { cn, priceToNumber } from "~/lib/utils";

export const meta = () => [
    { title: "Explore all trips | TravelSphere" },
    { name: "description", content: "Browse handpicked trips across India. Filter by state, style, budget and trip length." },
];

const STYLES = ["All", "Adventure", "Cultural", "Relaxed", "Spiritual", "Nature & Outdoors", "Luxury", "City Exploration"];
const SORTS = { recommended: "Recommended", priceLow: "Price: low to high", priceHigh: "Price: high to low", shortest: "Shortest first", longest: "Longest first" } as const;
type Sort = keyof typeof SORTS;
const PAGE = 8;

const select = "h-11 rounded-xl border border-light-400 bg-surface px-3 text-sm text-dark-100 outline-none focus:border-primary-100 focus:ring-2 focus:ring-primary-100/15 cursor-pointer";
const states = [...new Set(dummyTrips.map((t) => t.state).filter(Boolean) as string[])].sort();

/** Public "Explore all trips" page: search, quick style chips, filters and sorting over the sample trips. */
const TravelTrips = () => {
    const [params] = useSearchParams();
    const urlQuery = params.get("q") ?? "";

    const [query, setQuery] = useState(urlQuery);
    const [style, setStyle] = useState("All");
    const [state, setState] = useState("");
    const [group, setGroup] = useState("");
    const [budget, setBudget] = useState("");
    const [length, setLength] = useState<Length>("");
    const [sort, setSort] = useState<Sort>("recommended");
    const [shown, setShown] = useState(PAGE);

    // Searches from the landing page (?q=Kerala) update the box
    useEffect(() => setQuery(urlQuery), [urlQuery]);
    useEffect(() => setShown(PAGE), [query, style, state, group, budget, length]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = dummyTrips.filter(
            (t) =>
                (style === "All" || t.style === style) &&
                (!state || t.state === state) &&
                (!group || t.group === group) &&
                (!budget || t.budget === budget) &&
                fitsLength(t.dayCount, length) &&
                (!q || [t.name, t.location, t.style, ...(t.interests ?? [])].join(" ").toLowerCase().includes(q))
        );
        const by: Partial<Record<Sort, (a: (typeof list)[number], b: (typeof list)[number]) => number>> = {
            priceLow: (a, b) => priceToNumber(a.price) - priceToNumber(b.price),
            priceHigh: (a, b) => priceToNumber(b.price) - priceToNumber(a.price),
            shortest: (a, b) => a.dayCount - b.dayCount,
            longest: (a, b) => b.dayCount - a.dayCount,
        };
        return by[sort] ? [...list].sort(by[sort]) : list;
    }, [query, style, state, group, budget, length, sort]);

    const filtering = Boolean(query || style !== "All" || state || group || budget || length);
    const clear = () => {
        setQuery("");
        setStyle("All");
        setState("");
        setGroup("");
        setBudget("");
        setLength("");
    };

    return (
        <main className="flex flex-col">
            {/* Header with search */}
            <section className="relative overflow-hidden bg-linear-to-br from-primary-50 via-surface to-violet-50 border-b border-light-400">
                <span className="absolute -right-24 -top-24 size-96 rounded-full bg-primary-100/10 blur-3xl" />
                <div className="wrapper relative pt-32 pb-10 flex flex-col items-center text-center gap-5">
                    <h1 className="text-4xl md:text-5xl font-bold text-dark-100 tracking-tight">Explore all trips</h1>
                    <p className="text-gray-100 max-w-xl">Handpicked itineraries across India. Search a place or interest, or narrow it down with the filters.</p>
                    <label className="relative w-full max-w-2xl">
                        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-100" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Try Kerala, beaches, temples, trekking..."
                            aria-label="Search trips"
                            className="h-14 w-full rounded-full border border-light-400 bg-surface pl-13 pr-12 text-dark-100 shadow-lg shadow-dark-100/5 outline-none focus:border-primary-100 focus:ring-4 focus:ring-primary-100/10"
                        />
                        {query && (
                            <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 size-8 rounded-full flex items-center justify-center text-gray-100 hover:bg-light-200 cursor-pointer">
                                <X size={16} />
                            </button>
                        )}
                    </label>
                </div>
            </section>

            <div className="wrapper py-8 flex flex-col gap-6">
                {/* Travel style chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap" role="tablist" aria-label="Travel style">
                    {STYLES.map((s) => (
                        <button
                            key={s}
                            role="tab"
                            aria-selected={style === s}
                            onClick={() => setStyle(s)}
                            className={cn(
                                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-colors cursor-pointer",
                                style === s ? "bg-dark-100 border-dark-100 text-surface" : "bg-surface border-light-400 text-dark-200 hover:border-dark-100"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Filters + sort */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:flex">
                        <select value={state} onChange={(e) => setState(e.target.value)} aria-label="State" className={cn(select, state && "border-primary-100 text-primary-100 font-semibold")}>
                            <option value="">Any state</option>
                            {states.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Who is travelling" className={cn(select, group && "border-primary-100 text-primary-100 font-semibold")}>
                            <option value="">Anyone</option>
                            {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <select value={budget} onChange={(e) => setBudget(e.target.value)} aria-label="Budget" className={cn(select, budget && "border-primary-100 text-primary-100 font-semibold")}>
                            <option value="">Any budget</option>
                            {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select value={length} onChange={(e) => setLength(e.target.value as Length)} aria-label="Trip length" className={cn(select, length && "border-primary-100 text-primary-100 font-semibold")}>
                            <option value="">Any length</option>
                            {Object.entries(LENGTHS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <label className="relative lg:w-56">
                        <ArrowDownWideNarrow size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-100 pointer-events-none" />
                        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort trips" className={cn(select, "w-full pl-9")}>
                            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </label>
                </div>

                <span className="flex items-center gap-3 text-sm text-gray-100">
                    <span>
                        <strong className="text-dark-100">{results.length}</strong> {results.length === 1 ? "trip" : "trips"} found
                    </span>
                    {filtering && (
                        <button onClick={clear} className="flex items-center gap-1 text-xs font-semibold text-primary-100 hover:underline cursor-pointer">
                            <X size={13} /> Clear all
                        </button>
                    )}
                </span>

                {/* Results */}
                {results.length ? (
                    <>
                        <div className="trip-grid">
                            {results.slice(0, shown).map((t) => (
                                <TripCard key={t.id} id={t.id} name={t.name} imageUrl={t.imageUrl} location={t.location} tags={t.tags} price={t.price} href={`/travel/${t.id}`} />
                            ))}
                        </div>
                        {results.length > shown && (
                            <button
                                onClick={() => setShown((n) => n + PAGE)}
                                className="self-center h-11 px-6 rounded-full border border-light-400 bg-surface text-sm font-semibold text-dark-100 hover:border-primary-100 hover:text-primary-100 transition-colors cursor-pointer"
                            >
                                Show more trips ({results.length - shown} more)
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-center bg-surface rounded-3xl border border-dashed border-light-400 py-16 px-6">
                        <SearchX size={36} className="text-gray-100" />
                        <p className="text-dark-100 font-semibold">No trips match your search</p>
                        <p className="text-sm text-gray-100">Try fewer filters, or answer a few questions and let our AI suggest trips for you.</p>
                        <span className="flex flex-wrap justify-center gap-3 pt-1">
                            <button onClick={clear} className="h-10 px-5 rounded-full border border-light-400 text-sm font-semibold text-dark-100 hover:border-dark-100 cursor-pointer">
                                Clear filters
                            </button>
                            <Link to="/suggest" className="flex items-center gap-1.5 h-10 px-5 rounded-full bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold">
                                <Sparkles size={15} /> Ask AI to suggest
                            </Link>
                        </span>
                    </div>
                )}

                {/* AI nudge */}
                {results.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-linear-to-r from-primary-100 to-violet-600 text-white p-6 md:p-8">
                        <span className="flex flex-col gap-1">
                            <strong className="text-xl">Can't find the right trip?</strong>
                            <small className="text-white/80 text-sm">Answer a few quick questions and our AI picks the trips that suit you best.</small>
                        </span>
                        <Link to="/suggest" className="flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-surface text-primary-100 font-semibold hover:scale-105 transition-transform shrink-0">
                            <Sparkles size={17} /> Get AI suggestions
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
};

export default TravelTrips;

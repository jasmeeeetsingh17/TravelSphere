import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import {
    ArrowRight, CalendarDays, Clock, Heart, Loader2, MapPin, PartyPopper, RotateCcw, Sparkles, User, Users, Wallet, type LucideIcon,
} from "lucide-react";
import { budgetOptions as BUDGETS, MONTHS, TRIP_LENGTHS as LENGTHS, type TripLength as Length } from "~/constants";
import { dummyTrips } from "~/constants/dummyTrips";
import type { TripView } from "~/lib/trip-view";
import { cn } from "~/lib/utils";

export const meta = () => [
    { title: "AI Suggest: find your perfect trip | TravelSphere" },
    { name: "description", content: "Answer a few quick questions and AI picks the trips across India that suit you best." },
];

const STATES = [...new Set(dummyTrips.map((t) => t.state ?? ""))].filter(Boolean).sort();
const STYLES = [...new Set(dummyTrips.map((t) => t.style ?? ""))].filter(Boolean);
const GROUPS: [string, LucideIcon][] = [["Solo", User], ["Couple", Heart], ["Family", Users], ["Friends", PartyPopper]];
type Pick = { trip: TripView; reason: string };

const chip = (on: boolean) =>
    cn(
        "rounded-full px-3.5 py-2 text-sm font-medium border transition-colors cursor-pointer",
        on ? "bg-primary-100 border-primary-100 text-white" : "bg-surface border-light-400 text-dark-200 hover:border-primary-100"
    );

const Question = ({ title, children }: { title: string; children: ReactNode }) => (
    <fieldset className="flex flex-col gap-2.5">
        <legend className="text-sm font-semibold text-dark-100 mb-2.5">{title}</legend>
        {children}
    </fieldset>
);

/** Row of single-choice chips with an "any" option first. */
const Chips = ({ value, onChange, options, any }: { value: string; onChange: (v: string) => void; options: string[]; any: string }) => (
    <div className="flex flex-wrap gap-2">
        {["", ...options].map((o) => (
            <button key={o || "any"} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={chip(value === o)}>
                {o || any}
            </button>
        ))}
    </div>
);

/** Public "AI Suggest": a few quick questions, then AI picks the best trips from the catalogue. */
const AiSuggest = () => {
    const [params] = useSearchParams();
    const preset = (key: string, list: string[]) => list.find((v) => v.toLowerCase() === (params.get(key) ?? "").toLowerCase()) ?? "";

    const [state, setState] = useState(preset("state", STATES));
    const [group, setGroup] = useState(preset("group", GROUPS.map(([g]) => g)));
    const [style, setStyle] = useState(preset("style", STYLES));
    const [budget, setBudget] = useState(preset("budget", BUDGETS));
    const [month, setMonth] = useState("");
    const [length, setLength] = useState<Length>("");
    const [notes, setNotes] = useState("");
    const [company, setCompany] = useState(""); // hidden spam trap

    const [ai, setAi] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [picks, setPicks] = useState<Pick[] | null>(null);
    const [source, setSource] = useState<"gemini" | "rules">("rules");
    const resultsRef = useRef<HTMLElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        fetch("/api/suggest")
            .then((r) => r.json())
            .then((d) => setAi(Boolean(d.ai)))
            .catch(() => setAi(false));
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setPicks(null);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        try {
            const res = await fetch("/api/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state, group, style, budget, month, length, notes: notes.trim(), company }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? "Could not get suggestions.");
            const found = (data.picks as { id: string; reason: string }[])
                .map((p) => ({ trip: dummyTrips.find((t) => t.id === p.id), reason: p.reason }))
                .filter((p): p is Pick => Boolean(p.trip));
            setPicks(found);
            setSource(data.source === "gemini" ? "gemini" : "rules");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setState("");
        setGroup("");
        setStyle("");
        setBudget("");
        setMonth("");
        setLength("");
        setNotes("");
        setPicks(null);
        setError("");
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <main className="flex flex-col">
            {/* Header */}
            <section className="relative overflow-hidden bg-linear-to-br from-primary-50 via-surface to-violet-50 border-b border-light-400">
                <span className="absolute -right-24 -top-24 size-96 rounded-full bg-primary-100/10 blur-3xl" />
                <span className="absolute -left-24 bottom-0 size-72 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="wrapper relative pt-32 pb-12 flex flex-col items-center text-center gap-5">
                    <span className="flex items-center gap-2 bg-surface border border-light-400 shadow-sm rounded-full px-4 py-1.5 text-sm font-semibold text-primary-100">
                        <Sparkles size={16} /> {ai ? "AI Suggest · Powered by Google Gemini" : "AI Suggest"}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-dark-100 tracking-tight max-w-3xl">
                        Find the trip that <span className="whitespace-nowrap bg-linear-to-r from-primary-100 to-violet-600 bg-clip-text text-transparent">suits you</span>
                    </h1>
                    <p className="text-lg text-gray-100 max-w-2xl">
                        Answer a few quick questions. Skip any you're not sure about. Our AI picks the best trips for you and tells you why.
                    </p>
                </div>
            </section>

            <div className="wrapper py-10 flex flex-col gap-10">
                {/* Questions */}
                <form ref={formRef} onSubmit={submit} className="bg-surface rounded-3xl border border-light-400 shadow-sm p-5 md:p-8 flex flex-col gap-7 scroll-mt-24">
                    <Question title="Where would you like to go?">
                        <Chips value={state} onChange={setState} options={STATES} any="Anywhere" />
                    </Question>

                    <Question title="Who's going?">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {[["", Sparkles] as [string, LucideIcon], ...GROUPS].map(([g, Icon]) => (
                                <button
                                    key={g || "any"}
                                    type="button"
                                    aria-pressed={group === g}
                                    onClick={() => setGroup(g)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 h-12 rounded-2xl border-2 text-sm font-semibold transition-colors cursor-pointer",
                                        group === g ? "border-primary-100 bg-primary-50 text-primary-100" : "border-light-400 bg-surface text-dark-200 hover:border-primary-100/50"
                                    )}
                                >
                                    <Icon size={17} /> {g || "Anyone"}
                                </button>
                            ))}
                        </div>
                    </Question>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                        <Question title="What's your travel style?">
                            <Chips value={style} onChange={setStyle} options={STYLES} any="Surprise me" />
                        </Question>
                        <Question title="Budget">
                            <Chips value={budget} onChange={setBudget} options={BUDGETS} any="Any budget" />
                        </Question>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                        <Question title="When are you travelling?">
                            <label className="relative max-w-xs">
                                <CalendarDays size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-100 pointer-events-none" />
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    aria-label="Travel month"
                                    className="h-11 w-full rounded-xl border border-light-400 bg-surface pl-10 pr-3 text-sm text-dark-100 outline-none focus:border-primary-100 focus:ring-2 focus:ring-primary-100/15 cursor-pointer"
                                >
                                    <option value="">Not sure yet</option>
                                    {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </label>
                        </Question>
                        <Question title="How long?">
                            <div className="flex flex-wrap gap-2">
                                {(["", ...Object.keys(LENGTHS)] as Length[]).map((l) => (
                                    <button key={l || "any"} type="button" aria-pressed={length === l} onClick={() => setLength(l)} className={chip(length === l)}>
                                        {l ? LENGTHS[l] : "Any length"}
                                    </button>
                                ))}
                            </div>
                        </Question>
                    </div>

                    <Question title="Anything else? (optional)">
                        <input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value.slice(0, 300))}
                            placeholder="e.g. love beaches and seafood, travelling with kids, want to avoid long drives"
                            aria-label="Anything else"
                            className="h-12 w-full rounded-xl border border-light-400 bg-surface px-4 text-sm text-dark-100 outline-none focus:border-primary-100 focus:ring-2 focus:ring-primary-100/15"
                        />
                    </Question>
                    <input value={company} onChange={(e) => setCompany(e.target.value)} name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <button type="button" onClick={reset} className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-100 hover:text-dark-100 cursor-pointer">
                            <RotateCcw size={14} /> Clear answers
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-linear-to-r from-primary-100 to-violet-600 text-white font-semibold shadow-lg shadow-primary-100/30 hover:brightness-110 transition disabled:opacity-60 cursor-pointer"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {loading ? "Finding your trips..." : "Suggest trips"}
                        </button>
                    </div>
                </form>

                {/* Results */}
                <section ref={resultsRef} className="flex flex-col gap-5 scroll-mt-24" aria-live="polite">
                    {error && <p className="rounded-2xl bg-red-50 text-red-500 px-5 py-3 text-sm">{error}</p>}

                    {loading && (
                        <>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-dark-100">
                                <Loader2 size={20} className="animate-spin text-primary-100" /> Finding the best trips for you...
                            </h2>
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-5 bg-surface rounded-3xl border border-light-400 p-4 animate-pulse">
                                    <span className="h-48 md:h-40 md:w-64 rounded-2xl bg-light-300 shrink-0" />
                                    <span className="flex-1 flex flex-col gap-3 py-2">
                                        <span className="h-5 w-2/3 rounded bg-light-300" />
                                        <span className="h-4 w-1/3 rounded bg-light-300" />
                                        <span className="h-14 w-full rounded-xl bg-light-200" />
                                    </span>
                                </div>
                            ))}
                        </>
                    )}

                    {picks && (
                        <>
                            <header className="flex flex-col gap-1">
                                <h2 className="flex items-center gap-2 text-2xl font-bold text-dark-100">
                                    <Sparkles size={22} className="text-primary-100" /> Top picks for you
                                </h2>
                                <p className="text-sm text-gray-100">
                                    {source === "gemini" ? "Chosen by Google Gemini from our handpicked trips." : "Matched to your answers from our handpicked trips."} Prices are estimates.
                                </p>
                            </header>

                            <ol className="flex flex-col gap-5">
                                {picks.map(({ trip, reason }, i) => (
                                    <li key={trip.id}>
                                        <Link
                                            to={`/travel/${trip.id}`}
                                            className="group flex flex-col md:flex-row gap-5 bg-surface rounded-3xl border border-light-400 p-4 hover:border-primary-100 hover:shadow-lg transition-all"
                                        >
                                            <span className="relative h-48 md:h-auto md:w-64 rounded-2xl overflow-hidden shrink-0">
                                                <img src={trip.imageUrl} alt={trip.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                <span className={cn("absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold", i === 0 ? "bg-amber-400 text-dark-100" : "bg-surface/90 text-dark-100")}>
                                                    {i === 0 ? "Best match" : `#${i + 1}`}
                                                </span>
                                            </span>
                                            <span className="flex-1 min-w-0 flex flex-col gap-3 py-1 md:pr-2">
                                                <span className="flex flex-col gap-1">
                                                    <strong className="text-lg md:text-xl text-dark-100 group-hover:text-primary-100">{trip.name}</strong>
                                                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-100">
                                                        <span className="flex items-center gap-1"><MapPin size={14} /> {trip.location}</span>
                                                        <span className="flex items-center gap-1"><Clock size={14} /> {trip.duration}</span>
                                                        <span className="flex items-center gap-1"><Users size={14} /> {trip.group}</span>
                                                        <span className="flex items-center gap-1"><Wallet size={14} /> {trip.price}</span>
                                                    </span>
                                                </span>
                                                <span className="flex gap-2.5 rounded-2xl bg-primary-50/70 p-3.5 text-sm text-dark-200 leading-6">
                                                    <Sparkles size={16} className="text-primary-100 shrink-0 mt-1" />
                                                    {reason}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-sm font-semibold text-primary-100 mt-auto">
                                                    View trip and book <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ol>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 text-sm">
                                <span className="text-gray-100">Not quite right?</span>
                                <button
                                    type="button"
                                    onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                                    className="h-10 px-5 rounded-full border border-light-400 bg-surface font-semibold text-dark-100 hover:border-primary-100 hover:text-primary-100 cursor-pointer"
                                >
                                    Change answers
                                </button>
                                <Link to="/travel" className="h-10 px-5 rounded-full border border-light-400 bg-surface font-semibold text-dark-100 hover:border-primary-100 hover:text-primary-100 flex items-center">
                                    Browse all trips
                                </Link>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
};

export default AiSuggest;

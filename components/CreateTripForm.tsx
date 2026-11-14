import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
    Briefcase, Building2, Check, ChevronDown, Clock, Flame, Gem, Heart, History, Landmark, Lightbulb, Loader2, MapPin, Minus, Mountain,
    Palmtree, PartyPopper, Pencil, Plus, RefreshCw, RotateCcw, Save, Search, Sparkles, Trash2, Trees, User, Users, Wallet, X, type LucideIcon,
} from "lucide-react";
import { account } from "~/appwrite/client";
import { getAuthToken, saveTrip } from "~/appwrite/trips";
import {
    budgetOptions, BUDGET_NOTES, DAILY_COST, GROUP_SIZE, groupTypes, indianStates, interests as INTERESTS, MONTHS, NOTES_MAX,
    PLANNER_IDEAS as IDEAS, PLANNER_STEPS, POPULAR_STATES as POPULAR, STATE_IMAGES, travelStyles,
} from "~/constants";
import { generatedToView, type TripView } from "~/lib/trip-view";
import { cn, money } from "~/lib/utils";
import TripDetail from "./TripDetail";

type Props = {
    /** Where saved trips live, e.g. "/trips" (the new trip opens at /trips/:id) */
    basePath: string;
};

const GROUP_ICONS: Record<string, LucideIcon> = { Solo: User, Couple: Heart, Family: Users, Friends: PartyPopper, Business: Briefcase };
const STYLE_ICONS: Record<string, LucideIcon> = {
    Relaxed: Palmtree, Luxury: Gem, Adventure: Mountain, Cultural: Landmark, Spiritual: Flame, "Nature & Outdoors": Trees, "City Exploration": Building2,
};

/** Unsaved plans are kept in this browser so a refresh doesn't lose them. */
type SavedPlan = { key: string; at: number; trip: Trip };
const RECENT_KEY = "ts-admin-plans";
const readRecent = (): SavedPlan[] => {
    try {
        const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
        return Array.isArray(list) ? list.filter((p) => p?.trip).slice(0, 4) : [];
    } catch {
        return [];
    }
};
const writeRecent = (list: SavedPlan[]) => {
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 4)));
    } catch {
        // storage full or blocked: recent plans are a convenience only
    }
};

/** Numbered section of the form. */
const Step = ({ n, title, hint, done, children }: { n: number; title: string; hint?: string; done: boolean; children: ReactNode }) => (
    <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-5 md:p-7 flex flex-col gap-4">
        <header className="flex items-center gap-3">
            <span
                className={cn(
                    "size-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                    done ? "bg-success-500 text-white" : "bg-primary-50 text-primary-100"
                )}
            >
                {done ? <Check size={16} /> : n}
            </span>
            <span className="flex flex-col leading-tight">
                <h2 className="text-base md:text-lg font-semibold text-dark-100">{title}</h2>
                {hint && <small className="text-gray-100">{hint}</small>}
            </span>
        </header>
        {children}
    </section>
);

/** Clickable option tile with an icon. */
const Tile = ({ active, onClick, Icon, label, note }: { active: boolean; onClick: () => void; Icon?: LucideIcon; label: string; note?: string }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
            "relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer",
            active ? "border-primary-100 bg-primary-50/60 shadow-md shadow-primary-100/10" : "border-light-400 bg-white hover:border-primary-100/40 hover:-translate-y-0.5"
        )}
    >
        {active && (
            <span className="absolute top-2.5 right-2.5 size-5 rounded-full bg-primary-100 text-white flex items-center justify-center">
                <Check size={12} />
            </span>
        )}
        {Icon && (
            <span className={cn("size-10 rounded-xl flex items-center justify-center", active ? "bg-primary-100 text-white" : "bg-light-200 text-dark-200")}>
                <Icon size={20} />
            </span>
        )}
        <strong className="text-sm font-semibold text-dark-100 leading-tight">{label}</strong>
        {note && <small className="text-xs text-gray-100 leading-snug">{note}</small>}
    </button>
);

/** Searchable list of Indian states and union territories. */
const StatePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(value);
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => setText(value), [value]);
    useEffect(() => {
        const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const matches = indianStates.filter((s) => s.toLowerCase().includes(text.trim().toLowerCase()));
    const choose = (s: string) => {
        onChange(s);
        setText(s);
        setOpen(false);
    };

    return (
        <div ref={box} className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-100 pointer-events-none" />
            <input
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    setOpen(true);
                    if (value) onChange("");
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && open && matches[0]) {
                        e.preventDefault();
                        choose(matches[0]);
                    }
                    if (e.key === "Escape") setOpen(false);
                }}
                placeholder="Search a state or union territory"
                aria-label="State or union territory"
                role="combobox"
                aria-expanded={open}
                className="h-12 w-full rounded-xl border border-light-400 bg-white pl-11 pr-10 text-dark-100 outline-none focus:border-primary-100 focus:ring-2 focus:ring-primary-100/15"
            />
            <ChevronDown size={18} className={cn("absolute right-4 top-1/2 -translate-y-1/2 text-gray-100 pointer-events-none transition-transform", open && "rotate-180")} />
            {open && (
                <ul role="listbox" className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-xl border border-light-400 bg-white shadow-xl py-1">
                    {matches.length ? (
                        matches.map((s) => (
                            <li key={s}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={s === value}
                                    onClick={() => choose(s)}
                                    className={cn("w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-primary-50 cursor-pointer", s === value && "text-primary-100 font-semibold")}
                                >
                                    <MapPin size={15} className="text-gray-100" /> {s}
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-3 text-sm text-gray-100">No state matches "{text}"</li>
                    )}
                </ul>
            )}
        </div>
    );
};

const toView = (trip: Trip) => generatedToView(trip, { id: "preview", saved: false });

/** Admin AI Trip Planner: generate a plan, review it, try again if needed, then save it as a trip. */
const CreateTripForm = ({ basePath }: Props) => {
    const steps = PLANNER_STEPS;
    const resultRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [params] = useSearchParams();

    // Presets from the address, e.g. /trips/create?state=Goa&style=Adventure&budget=Luxury&group=Friends
    const preset = (key: string, list: string[]) => list.find((v) => v.toLowerCase() === (params.get(key) ?? "").toLowerCase()) ?? "";
    const [state, setState] = useState(preset("state", indianStates));
    const [travelStyle, setTravelStyle] = useState(preset("style", travelStyles));
    const [budget, setBudget] = useState(preset("budget", budgetOptions));
    const [groupType, setGroupType] = useState(preset("group", groupTypes));
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [duration, setDuration] = useState(5);
    const [month, setMonth] = useState("");
    const [notes, setNotes] = useState("");

    const [recent, setRecent] = useState<SavedPlan[]>([]);
    const topRef = useRef<HTMLDivElement>(null);
    useEffect(() => setRecent(readRecent()), []);

    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState("");
    const [generated, setGenerated] = useState<Trip | null>(null);
    const [recentKey, setRecentKey] = useState("");
    const [saving, setSaving] = useState(false);
    const preview: TripView | null = useMemo(() => (generated ? toView(generated) : null), [generated]);

    // Walk through the loading messages while the AI works
    useEffect(() => {
        if (!loading) return setLoadingStep(0);
        const id = setInterval(() => setLoadingStep((s) => Math.min(s + 1, steps.length - 1)), 2200);
        return () => clearInterval(id);
    }, [loading, steps.length]);

    const people = GROUP_SIZE[groupType] ?? 1;
    const estimate = budget ? (DAILY_COST[budget] ?? 0) * duration * people : 0;
    const filled = [state, travelStyle, groupType, budget, selectedInterests.length ? "x" : ""].filter(Boolean).length;
    const image = STATE_IMAGES[state] ?? "/assets/images/hero-img1.jpg";

    const missing = useMemo(
        () =>
            [!state && "a state", !groupType && "who is travelling", !travelStyle && "a travel style", !budget && "a budget", !selectedInterests.length && "at least one interest"].filter(
                Boolean
            ) as string[],
        [state, groupType, travelStyle, budget, selectedInterests]
    );

    const toggleInterest = (i: string) =>
        setSelectedInterests((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]));

    const reset = () => {
        setState("");
        setTravelStyle("");
        setBudget("");
        setGroupType("");
        setSelectedInterests([]);
        setDuration(5);
        setMonth("");
        setNotes("");
        setError("");
        setGenerated(null);
    };

    const applyIdea = (idea: (typeof IDEAS)[number]) => {
        setState(idea.state);
        setDuration(idea.days);
        setGroupType(idea.group);
        setTravelStyle(idea.style);
        setBudget(idea.budget);
        setSelectedInterests(idea.interests);
        setError("");
    };

    const showResult = () => setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

    const openRecent = (p: SavedPlan) => {
        setGenerated(p.trip);
        setRecentKey(p.key);
        setError("");
        showResult();
    };

    const removeRecent = (key: string) =>
        setRecent((list) => {
            const next = list.filter((p) => p.key !== key);
            writeRecent(next);
            return next;
        });

    const editChoices = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        generate();
    };

    const generate = async () => {
        setError("");
        setGenerated(null);

        if (missing.length) {
            setError(`Please choose ${missing.join(", ")}.`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/create-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-appwrite-jwt": await getAuthToken() },
                body: JSON.stringify({ state, travelStyle, interest: selectedInterests.join(", "), budget, groupType, duration, month, notes: notes.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? "Could not generate the trip.");

            const trip = data.trip as Trip;

            // Show the plan for review; it is only saved when the admin clicks "Save as trip"
            const entry: SavedPlan = { key: `${Date.now()}`, at: Date.now(), trip };
            setGenerated(trip);
            setRecentKey(entry.key);
            setLoading(false);
            setRecent((list) => {
                const next = [entry, ...list].slice(0, 4);
                writeRecent(next);
                return next;
            });
            showResult();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const saveGenerated = async () => {
        if (!generated) return;
        setSaving(true);
        setError("");
        try {
            const me = await account.get();
            const id = await saveTrip(generated, me.$id);
            if (recentKey) removeRecent(recentKey);
            navigate(`${basePath}/${id}`);
        } catch (saveError) {
            const reason = saveError instanceof Error ? saveError.message : "Unknown error";
            setError(`The trip could not be saved. Appwrite said: "${reason}"`);
            setSaving(false);
        }
    };

    const saveButton = (
        <button
            type="button"
            onClick={saveGenerated}
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-linear-to-r from-primary-100 to-violet-600 text-white text-sm font-semibold shadow-md shadow-primary-100/30 hover:brightness-110 disabled:opacity-60 transition cursor-pointer"
        >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? "Saving..." : "Save as trip"}
        </button>
    );

    return (
        <div ref={topRef} className="flex flex-col gap-10 scroll-mt-24">
            <div className="flex flex-col gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-dark-100">
                    <Lightbulb size={16} className="text-amber-500" /> Need an idea? Start from one of these
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
                    {IDEAS.map((idea) => (
                        <button
                            key={idea.label}
                            type="button"
                            onClick={() => applyIdea(idea)}
                            className="shrink-0 rounded-full border border-light-400 bg-white px-4 py-2 text-sm font-medium text-dark-200 hover:border-primary-100 hover:text-primary-100 transition-colors cursor-pointer"
                        >
                            {idea.label}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
                {/* ---------------- Steps ---------------- */}
                <div className="flex flex-col gap-5">
                    <Step n={1} title="Where to?" hint="Any of India's 28 states and 8 union territories" done={!!state}>
                        <StatePicker value={state} onChange={setState} />
                        <div className="flex flex-wrap items-center gap-2">
                            <small className="text-gray-100 mr-1">Popular:</small>
                            {POPULAR.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setState(p)}
                                    className={cn(
                                        "rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer",
                                        state === p ? "bg-primary-100 border-primary-100 text-white" : "bg-light-200 border-transparent text-dark-200 hover:border-primary-100"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </Step>

                    <Step n={2} title="When and how long?" hint="Pick your month so the plan fits the weather and festivals" done>
                        <div className="flex flex-wrap gap-2">
                            {["", ...MONTHS].map((m) => (
                                <button
                                    key={m || "any"}
                                    type="button"
                                    onClick={() => setMonth(m)}
                                    aria-pressed={month === m}
                                    className={cn(
                                        "rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer",
                                        month === m ? "bg-primary-100 border-primary-100 text-white" : "bg-light-200 border-transparent text-dark-200 hover:border-primary-100"
                                    )}
                                >
                                    {m ? m.slice(0, 3) : "Not sure yet"}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDuration((d) => Math.max(1, d - 1))}
                                    disabled={duration <= 1}
                                    aria-label="Fewer days"
                                    className="size-11 rounded-xl border border-light-400 flex items-center justify-center text-dark-100 hover:border-primary-100 disabled:opacity-30 cursor-pointer"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="w-24 text-center">
                                    <strong className="block text-3xl font-bold text-dark-100 tabular-nums">{duration}</strong>
                                    <small className="text-gray-100">{duration === 1 ? "day" : "days"}</small>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setDuration((d) => Math.min(14, d + 1))}
                                    disabled={duration >= 14}
                                    aria-label="More days"
                                    className="size-11 rounded-xl border border-light-400 flex items-center justify-center text-dark-100 hover:border-primary-100 disabled:opacity-30 cursor-pointer"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={14}
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                aria-label="Trip length in days"
                                className="flex-1 accent-primary-100 cursor-pointer"
                            />
                            <div className="flex gap-2">
                                {[3, 5, 7].map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDuration(d)}
                                        className={cn(
                                            "rounded-full px-3 py-1.5 text-xs font-semibold border cursor-pointer",
                                            duration === d ? "bg-primary-100 border-primary-100 text-white" : "bg-light-200 border-transparent text-dark-200 hover:border-primary-100"
                                        )}
                                    >
                                        {d === 7 ? "1 week" : `${d} days`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Step>

                    <Step n={3} title="Who is travelling?" done={!!groupType}>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {groupTypes.map((g) => (
                                <Tile
                                    key={g}
                                    active={groupType === g}
                                    onClick={() => setGroupType(g)}
                                    Icon={GROUP_ICONS[g]}
                                    label={g}
                                    note={`${GROUP_SIZE[g] ?? 1} ${(GROUP_SIZE[g] ?? 1) === 1 ? "person" : "people"}`}
                                />
                            ))}
                        </div>
                    </Step>

                    <Step n={4} title="Travel style" done={!!travelStyle}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {travelStyles.map((s) => (
                                <Tile key={s} active={travelStyle === s} onClick={() => setTravelStyle(s)} Icon={STYLE_ICONS[s]} label={s} />
                            ))}
                        </div>
                    </Step>

                    <Step n={5} title="Budget" hint="Rough cost per person per day" done={!!budget}>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {budgetOptions.map((b) => (
                                <Tile
                                    key={b}
                                    active={budget === b}
                                    onClick={() => setBudget(b)}
                                    Icon={Wallet}
                                    label={`${b} · ${money(DAILY_COST[b] ?? 0)}`}
                                    note={BUDGET_NOTES[b]}
                                />
                            ))}
                        </div>
                    </Step>

                    <Step n={6} title="Interests" hint="Pick as many as you like" done={selectedInterests.length > 0}>
                        <ul className="flex flex-wrap gap-2">
                            {INTERESTS.map((i) => {
                                const on = selectedInterests.includes(i);
                                return (
                                    <li key={i}>
                                        <button
                                            type="button"
                                            onClick={() => toggleInterest(i)}
                                            aria-pressed={on}
                                            className={cn(
                                                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border transition-colors cursor-pointer",
                                                on ? "bg-primary-100 border-primary-100 text-white" : "bg-white border-light-400 text-dark-200 hover:border-primary-100"
                                            )}
                                        >
                                            {on && <Check size={14} />} {i}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </Step>

                    <Step n={7} title="Anything else?" hint="Optional. The AI will try to fit it in" done={notes.trim().length > 0}>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
                            rows={3}
                            placeholder="e.g. vegetarian food, travelling with grandparents, no early mornings, want a houseboat night"
                            aria-label="Anything else the AI should know"
                            className="w-full rounded-xl border border-light-400 bg-white px-4 py-3 text-sm text-dark-100 outline-none resize-none focus:border-primary-100 focus:ring-2 focus:ring-primary-100/15"
                        />
                        <small className="self-end text-xs text-gray-100 tabular-nums">{notes.length}/{NOTES_MAX}</small>
                    </Step>
                </div>

                {/* ---------------- Summary ---------------- */}
                <aside className={cn("lg:sticky flex flex-col bg-white rounded-3xl border border-light-400 shadow-sm overflow-hidden", "lg:top-24")}>
                    <figure className="relative h-44">
                        <img src={image} alt="" className="size-full object-cover" />
                        <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                        <figcaption className="absolute bottom-0 left-0 right-0 p-5 text-white">
                            <small className="text-white/75">Your trip</small>
                            <strong className="block text-xl leading-snug">
                                {state ? `${duration}-day ${travelStyle || ""} trip to ${state}`.replace(/\s+/g, " ") : "Choose a destination"}
                            </strong>
                        </figcaption>
                    </figure>

                    <div className="p-5 flex flex-col gap-4">
                        <ul className="flex flex-col gap-2.5 text-sm">
                            {[
                                ["When", month || "Any time"],
                                ["Group", groupType ? `${groupType} (${people} ${people === 1 ? "person" : "people"})` : "-"],
                                ["Style", travelStyle || "-"],
                                ["Budget", budget || "-"],
                                ["Interests", selectedInterests.length ? selectedInterests.join(", ") : "-"],
                            ].map(([k, v]) => (
                                <li key={k} className="flex justify-between gap-4">
                                    <span className="text-gray-100 shrink-0">{k}</span>
                                    <span className="font-medium text-dark-100 text-right line-clamp-2">{v}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="rounded-2xl bg-light-200 p-4 flex flex-col gap-0.5">
                            <small className="text-gray-100">Estimated price</small>
                            <strong className="text-2xl font-bold text-dark-100 tabular-nums">{estimate ? money(estimate) : "₹ -"}</strong>
                            <small className="text-xs text-gray-100">
                                {estimate ? `${money(DAILY_COST[budget] ?? 0)} × ${duration} days × ${people} ${people === 1 ? "person" : "people"}. The AI may adjust it.` : "Pick a budget to see an estimate"}
                            </small>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="flex justify-between text-xs text-gray-100">
                                <span>{filled} of 5 choices made</span>
                                <span>{Math.round((filled / 5) * 100)}%</span>
                            </span>
                            <span className="h-1.5 rounded-full bg-light-300 overflow-hidden">
                                <span className="block h-full rounded-full bg-linear-to-r from-primary-100 to-violet-600 transition-all duration-500" style={{ width: `${(filled / 5) * 100}%` }} />
                            </span>
                        </div>

                        {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-linear-to-r from-primary-100 to-violet-600 text-white font-semibold shadow-lg shadow-primary-100/30 hover:brightness-110 transition disabled:opacity-60 cursor-pointer"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {loading ? "Generating..." : "Generate trip with AI"}
                        </button>
                        <button type="button" onClick={reset} className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-100 hover:text-dark-100 cursor-pointer">
                            <RotateCcw size={14} /> Start over
                        </button>
                    </div>
                </aside>
            </form>

            {/* Progress while the AI works */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-100/50 backdrop-blur-sm px-4" role="status" aria-live="polite">
                    <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 flex flex-col items-center gap-5 text-center">
                        <span className="relative size-16">
                            <span className="absolute inset-0 rounded-full border-4 border-primary-50 border-t-primary-100 border-r-violet-500 animate-spin" />
                            <Sparkles size={24} className="absolute inset-0 m-auto text-primary-100" />
                        </span>
                        <span className="flex flex-col gap-1">
                            <strong className="text-lg text-dark-100">Creating your {state} trip</strong>
                            <small className="text-gray-100">This usually takes 10 to 20 seconds</small>
                        </span>
                        <ol className="w-full flex flex-col gap-2 text-left">
                            {steps.map((s, i) => (
                                <li key={s} className={cn("flex items-center gap-2.5 text-sm transition-colors", i < loadingStep ? "text-success-700" : i === loadingStep ? "text-dark-100 font-semibold" : "text-gray-100/60")}>
                                    {i < loadingStep ? <Check size={16} /> : i === loadingStep ? <Loader2 size={16} className="animate-spin text-primary-100" /> : <span className="size-4 rounded-full border-2 border-light-400" />}
                                    {s}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}

            {!preview && recent.length > 0 && (
                <section className="flex flex-col gap-3">
                    <header className="flex items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-dark-100">
                            <History size={18} className="text-primary-100" /> Unsaved plans
                        </h2>
                        <small className="text-xs text-gray-100">Kept in this browser until you save them</small>
                    </header>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {recent.map((p) => (
                            <li key={p.key} className="relative">
                                <button
                                    type="button"
                                    onClick={() => openRecent(p)}
                                    className="w-full flex items-center gap-3 rounded-2xl border border-light-400 bg-white p-3 pr-10 text-left hover:border-primary-100 transition-colors cursor-pointer"
                                >
                                    <img src={toView(p.trip).imageUrl} alt="" className="size-14 rounded-xl object-cover shrink-0" />
                                    <span className="flex flex-col min-w-0 leading-tight gap-1">
                                        <strong className="text-sm text-dark-100 truncate">{toView(p.trip).name}</strong>
                                        <small className="flex items-center gap-1 text-xs text-gray-100">
                                            <Clock size={12} /> {toView(p.trip).duration} · {new Date(p.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </small>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeRecent(p.key)}
                                    aria-label={`Remove ${toView(p.trip).name}`}
                                    className="absolute top-2 right-2 size-7 rounded-full flex items-center justify-center text-gray-100 hover:bg-light-200 hover:text-red-500 cursor-pointer"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {preview && (
                <div ref={resultRef} className="flex flex-col gap-6 scroll-mt-24">
                    <div className="relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5 rounded-3xl bg-white border border-light-400 shadow-sm p-5 md:p-6">
                        <span className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-primary-100 to-violet-600" />
                        <span className="flex items-start gap-4 min-w-0">
                            <span className="size-12 shrink-0 rounded-2xl bg-linear-to-br from-primary-100 to-violet-600 text-white flex items-center justify-center shadow-md shadow-primary-100/30">
                                <Sparkles size={22} />
                            </span>
                            <span className="flex flex-col gap-2 min-w-0">
                                <span className="flex flex-wrap items-center gap-2">
                                    <strong className="text-lg text-dark-100">Your plan is ready</strong>
                                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-violet-50 text-violet-700">Planned by Google Gemini</span>
                                </span>
                                <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-100">
                                    <span className="flex items-center gap-1.5"><Clock size={14} /> {preview.duration}</span>
                                    <span className="flex items-center gap-1.5"><Users size={14} /> {preview.group}</span>
                                    {preview.price && <span className="flex items-center gap-1.5"><Wallet size={14} /> {preview.price}</span>}
                                </span>
                            </span>
                        </span>

                        <span className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
                            <button type="button" onClick={editChoices} className="flex items-center gap-1.5 h-11 px-3 text-sm font-semibold text-gray-100 hover:text-dark-100 cursor-pointer">
                                <Pencil size={15} /> Change choices
                            </button>
                            <button
                                type="button"
                                onClick={generate}
                                disabled={loading || saving}
                                className="flex items-center gap-2 h-11 px-4 rounded-xl border border-light-400 text-sm font-semibold text-dark-100 hover:border-primary-100 hover:text-primary-100 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                                <RefreshCw size={15} /> Try again
                            </button>
                            {saveButton}
                        </span>
                    </div>
                    {error && <p className="rounded-2xl bg-red-50 text-red-500 px-5 py-3 text-sm">{error}</p>}
                    <TripDetail trip={preview} backTo={basePath} />
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 rounded-3xl bg-white border border-light-400 p-4 md:p-5">
                        <button
                            type="button"
                            onClick={() => {
                                setGenerated(null);
                                editChoices();
                            }}
                            className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-100 hover:text-red-500 cursor-pointer"
                        >
                            <X size={15} /> Discard plan
                        </button>
                        <span className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <small className="text-xs text-gray-100 text-center sm:text-right">Saving adds it to your trips. You can edit everything afterwards.</small>
                            {saveButton}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateTripForm;

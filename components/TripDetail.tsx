import { useState } from "react";
import { Link } from "react-router";
import {
    ArrowLeft, CalendarDays, Check, ChevronDown, Clock, CloudSun, MapPin, Share2, Sparkles, Sun, Ticket, Users, Wallet,
} from "lucide-react";
import type { TripView } from "~/lib/trip-view";
import { cn } from "~/lib/utils";

type Props = {
    trip: TripView | null;
    backTo: string;
    /** Show the "Find similar trips with AI" link (public site only) */
    showAi?: boolean;
    /** Extra content in the summary card (booking form, admin edit/delete) */
    actions?: React.ReactNode;
    /** Show how many people booked (admin pages) */
    showBookings?: boolean;
    /** Show a Share button (public site) */
    shareable?: boolean;
    /** Shown above the trip, e.g. when a generated trip could not be saved */
    notice?: string;
};

/** "09:00 AM: Visit the fort" -> ["09:00 AM", "Visit the fort"] */
const splitActivity = (a: string): [string, string] => {
    const m = /^(\d{1,2}:\d{2}\s?(?:AM|PM)?)\s*:\s*(.*)$/i.exec(a);
    return m ? [m[1], m[2]] : ["", a];
};

/** "Day 2 - Nubra Valley" -> ["Day 2", "Nubra Valley"] */
const splitDay = (title: string): [string, string] => {
    const [day, ...rest] = title.split(" - ");
    return [day, rest.join(" - ")];
};

const ShareButton = ({ title }: { title: string }) => {
    const [copied, setCopied] = useState(false);
    const share = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // the person closed the share sheet
        }
    };
    return (
        <button onClick={share} className="flex items-center gap-2 h-10 px-4 rounded-full border border-light-400 bg-surface text-sm font-semibold text-dark-100 hover:border-primary-100 hover:text-primary-100 transition-colors cursor-pointer">
            {copied ? <Check size={16} className="text-success-700" /> : <Share2 size={16} />} {copied ? "Link copied" : "Share"}
        </button>
    );
};

const TripDetail = ({ trip, backTo, showAi = false, actions, notice, showBookings = false, shareable = false }: Props) => {
    const [openDays, setOpenDays] = useState<Set<number>>(() => new Set([0]));

    if (!trip) {
        return (
            <section className="flex flex-col items-center gap-4 py-24 text-center">
                <h1 className="text-2xl font-semibold text-dark-100">Trip not found</h1>
                <p className="text-gray-100">This trip may have been removed.</p>
                <Link to={backTo} className="text-primary-100 font-semibold">Back to all trips</Link>
            </section>
        );
    }

    const allOpen = openDays.size === trip.days.length;
    const toggleDay = (i: number) =>
        setOpenDays((s) => {
            const next = new Set(s);
            if (next.has(i)) next.delete(i);
            else next.add(i);
            return next;
        });

    const pills = [
        { Icon: Clock, text: trip.duration },
        { Icon: Users, text: trip.group },
        trip.budget ? { Icon: Wallet, text: trip.budget } : null,
        trip.price ? { Icon: Ticket, text: trip.price } : null,
    ].filter(Boolean) as { Icon: typeof Clock; text: string }[];

    const facts = [
        { Icon: Clock, label: "Duration", value: trip.duration },
        { Icon: Users, label: "Best for", value: trip.group },
        { Icon: Wallet, label: "Estimated price", value: trip.price || "On request" },
        { Icon: CalendarDays, label: "Best time", value: trip.bestTime || "All year" },
        ...(showBookings ? [{ Icon: Ticket, label: "Booked", value: `${trip.bookings} ${trip.bookings === 1 ? "person" : "people"}` }] : []),
    ];

    const place = trip.location || [trip.state, "India"].filter(Boolean).join(", ");
    const highlights = trip.interests?.length ? trip.interests : trip.tags;

    return (
        <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-3">
                <Link to={backTo} className="flex items-center gap-2 text-sm font-medium text-gray-100 hover:text-primary-100 w-fit transition-colors">
                    <ArrowLeft size={18} /> Back to all trips
                </Link>
                {shareable && <ShareButton title={trip.name} />}
            </div>

            {notice && <p className="rounded-2xl bg-red-50 text-red-500 px-5 py-3 text-sm">{notice}</p>}

            {/* Hero */}
            <figure className="relative h-80 md:h-[460px] rounded-3xl overflow-hidden">
                <img src={trip.imageUrl} alt={trip.name} className="size-full object-cover" />
                <span className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white flex flex-col gap-3">
                    {trip.style && <span className="w-fit rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold">{trip.style}</span>}
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl">{trip.name}</h1>
                    <span className="flex items-center gap-1.5 text-sm md:text-base text-white/90">
                        <MapPin size={17} /> {place}
                    </span>
                    <ul className="flex flex-wrap gap-2 pt-1">
                        {pills.map(({ Icon, text }) => (
                            <li key={text} className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 px-3 py-1.5 text-xs md:text-sm font-medium">
                                <Icon size={14} /> {text}
                            </li>
                        ))}
                    </ul>
                </figcaption>
            </figure>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* ---------------- Main column ---------------- */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Overview */}
                    <article className="bg-surface rounded-3xl border border-light-400 p-6 md:p-8 flex flex-col gap-4">
                        <h2 className="text-xl font-semibold text-dark-100">About this trip</h2>
                        <p className="text-gray-100 leading-7">{trip.description}</p>
                        {highlights.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <small className="text-xs font-semibold uppercase tracking-wider text-gray-100">Highlights</small>
                                <ul className="flex flex-wrap gap-2">
                                    {highlights.map((h) => (
                                        <li key={h} className="flex items-center gap-1.5 rounded-full bg-primary-50 text-primary-100 px-3 py-1.5 text-xs font-semibold">
                                            <Check size={13} /> {h}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </article>

                    {/* Itinerary timeline */}
                    <article className="bg-surface rounded-3xl border border-light-400 p-6 md:p-8 flex flex-col gap-5">
                        <header className="flex items-center justify-between gap-3">
                            <span className="flex flex-col">
                                <h2 className="text-xl font-semibold text-dark-100">Day-by-day itinerary</h2>
                                <small className="text-sm text-gray-100">{trip.days.length} {trip.days.length === 1 ? "day" : "days"} planned</small>
                            </span>
                            {trip.days.length > 1 && (
                                <button
                                    onClick={() => setOpenDays(allOpen ? new Set() : new Set(trip.days.map((_, i) => i)))}
                                    className="text-sm font-semibold text-primary-100 hover:underline cursor-pointer shrink-0"
                                >
                                    {allOpen ? "Collapse all" : "Expand all"}
                                </button>
                            )}
                        </header>

                        <ol className="relative flex flex-col">
                            {trip.days.map((d, i) => {
                                const [dayLabel, location] = splitDay(d.title);
                                const open = openDays.has(i);
                                const last = i === trip.days.length - 1;
                                return (
                                    <li key={d.title} className="relative flex gap-4">
                                        {/* rail */}
                                        <span className="flex flex-col items-center">
                                            <span className={cn("size-9 shrink-0 rounded-full text-sm font-bold flex items-center justify-center z-10", open ? "bg-primary-100 text-white" : "bg-primary-50 text-primary-100")}>
                                                {i + 1}
                                            </span>
                                            {!last && <span className="flex-1 w-0.5 bg-light-400 my-1" />}
                                        </span>

                                        <div className={cn("flex-1 min-w-0", !last && "pb-5")}>
                                            <button onClick={() => toggleDay(i)} aria-expanded={open} className="w-full flex items-center justify-between gap-3 text-left pt-1.5 cursor-pointer group">
                                                <span className="flex flex-col leading-tight">
                                                    <small className="text-xs font-semibold text-gray-100">{dayLabel}</small>
                                                    <strong className="text-base text-dark-100 group-hover:text-primary-100">{location || dayLabel}</strong>
                                                </span>
                                                <ChevronDown size={18} className={cn("shrink-0 text-gray-100 transition-transform", open && "rotate-180")} />
                                            </button>
                                            {open && (
                                                <ul className="mt-3 flex flex-col gap-2">
                                                    {d.activities.map((a) => {
                                                        const [time, text] = splitActivity(a);
                                                        return (
                                                            <li key={a} className="flex items-start gap-3 rounded-xl bg-light-200 px-3 py-2.5">
                                                                {time && <span className="shrink-0 rounded-md bg-surface border border-light-400 px-2 py-0.5 text-[11px] font-semibold text-dark-200 tabular-nums">{time}</span>}
                                                                <span className="text-sm text-dark-200 leading-6">{text}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </article>

                    {/* Season + weather */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <article className="bg-surface rounded-3xl border border-light-400 p-6 flex flex-col gap-3">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-dark-100">
                                <Sun size={20} className="text-amber-500" /> Best time to visit
                            </h2>
                            <p className="text-sm text-gray-100 leading-6">{trip.bestTime || "Good to visit all year."}</p>
                        </article>
                        <article className="bg-surface rounded-3xl border border-light-400 p-6 flex flex-col gap-3">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-dark-100">
                                <CloudSun size={20} className="text-primary-100" /> Weather
                            </h2>
                            {trip.weather.length ? (
                                <ul className="flex flex-col gap-1.5 text-sm text-gray-100 leading-6">
                                    {trip.weather.map((w) => <li key={w}>{w}</li>)}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-100">Check the forecast a week before you travel.</p>
                            )}
                        </article>
                    </div>
                </div>

                {/* ---------------- Summary card ---------------- */}
                <aside className="flex flex-col gap-5 bg-surface rounded-3xl border border-light-400 shadow-sm p-6 lg:sticky lg:top-24">
                    <h2 className="text-lg font-semibold text-dark-100">Trip summary</h2>
                    <ul className="flex flex-col gap-3.5">
                        {facts.map(({ Icon, label, value }) => (
                            <li key={label} className="flex items-center gap-3">
                                <span className="size-10 rounded-xl bg-primary-50 text-primary-100 flex items-center justify-center shrink-0">
                                    <Icon size={19} />
                                </span>
                                <span className="flex flex-col leading-tight min-w-0">
                                    <small className="text-xs text-gray-100">{label}</small>
                                    <strong className="text-sm text-dark-100">{value}</strong>
                                </span>
                            </li>
                        ))}
                    </ul>

                    {actions}

                    {showAi && (
                        <Link
                            to={`/suggest?${new URLSearchParams({ state: trip.state ?? "", style: trip.style ?? "", group: trip.group ?? "", budget: trip.budget ?? "" })}`}
                            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-primary-100 text-primary-100 font-semibold hover:bg-primary-50 transition-colors"
                        >
                            <Sparkles size={18} /> Find similar trips with AI
                        </Link>
                    )}
                </aside>
            </div>
        </section>
    );
};

export default TripDetail;

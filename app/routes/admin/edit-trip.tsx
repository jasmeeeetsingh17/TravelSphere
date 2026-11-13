import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Check, Loader2, MapPin, Plus, Save, Trash2, X } from "lucide-react";
import { adminCall } from "~/appwrite/admin";
import { getTripForEdit, type EditableTrip } from "~/appwrite/trips";
import { budgetOptions, groupTypes, interests as INTERESTS, travelStyles } from "~/constants";
import { indianStates } from "~/constants/indiaStates";
import { cn, money, priceToNumber } from "~/lib/utils";
import type { Route } from "./+types/edit-trip";

export const meta = () => [{ title: "Edit trip | TravelSphere Admin" }];

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => await getTripForEdit(params.tripId);

const IMAGES = [...Array.from({ length: 15 }, (_, i) => `/assets/images/${i + 1}.jpg`), "/assets/images/card-img-2.png"];

const input = "h-11 w-full rounded-xl border border-light-400 bg-white px-4 text-sm text-dark-100 outline-none focus:border-primary-100 focus:ring-2 focus:ring-primary-100/15";
const label = "flex flex-col gap-2 text-sm font-medium text-dark-100";

const Card = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
    <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 md:p-8 flex flex-col gap-5">
        <header className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold text-dark-100">{title}</h2>
            {subtitle && <p className="text-sm text-gray-100">{subtitle}</p>}
        </header>
        {children}
    </section>
);

const Select = ({ value, options, onChange, placeholder }: { value: string; options: string[]; onChange: (v: string) => void; placeholder: string }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(input, "cursor-pointer")}>
        <option value="">{placeholder}</option>
        {/* Keep an unknown saved value selectable instead of silently dropping it */}
        {value && !options.includes(value) && <option value={value}>{value}</option>}
        {options.map((o) => (
            <option key={o} value={o}>{o}</option>
        ))}
    </select>
);

const EditTrip = ({ loaderData, params }: Route.ComponentProps) => {
    const navigate = useNavigate();
    const original = loaderData?.trip;

    const [trip, setTrip] = useState<EditableTrip | null>(() =>
        original
            ? {
                  ...original,
                  state: original.state ?? indianStates.find((s) => `${original.location?.city} ${original.name}`.includes(s)) ?? "",
                  itinerary: original.itinerary?.length ? original.itinerary : [{ day: 1, location: "", activities: [{ time: "09:00 AM", description: "" }] }],
              }
            : null
    );
    const [price, setPrice] = useState(() => priceToNumber(original?.estimatedPrice ?? ""));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    if (!trip) {
        return (
            <main className="dashboard wrapper items-center text-center py-24 gap-4">
                <h1 className="text-2xl font-semibold text-dark-100">Trip not found</h1>
                <Link to="/trips" className="text-primary-100 font-semibold">Back to all trips</Link>
            </main>
        );
    }

    const set = <K extends keyof EditableTrip>(key: K, value: EditableTrip[K]) => setTrip((t) => (t ? { ...t, [key]: value } : t));
    const chosenInterests = trip.interests.split(",").map((s) => s.trim()).filter(Boolean);
    const toggleInterest = (i: string) =>
        set("interests", (chosenInterests.includes(i) ? chosenInterests.filter((x) => x !== i) : [...chosenInterests, i]).join(", "));

    const days = trip.itinerary;
    const setDays = (next: DayPlan[]) => set("itinerary", next.map((d, i) => ({ ...d, day: i + 1 })));
    const updateDay = (i: number, patch: Partial<DayPlan>) => setDays(days.map((d, j) => (j === i ? { ...d, ...patch } : d)));
    const updateActivity = (di: number, ai: number, patch: Partial<Activity>) =>
        updateDay(di, { activities: days[di].activities.map((a, j) => (j === ai ? { ...a, ...patch } : a)) });

    const cover = trip.imageUrls?.[0];
    const setCover = (url: string) => set("imageUrls", [url, ...(trip.imageUrls ?? []).filter((u) => u !== url)].slice(0, 3));

    const save = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (!trip.name.trim()) return setError("Give the trip a name.");
        if (!trip.state) return setError("Pick a state.");
        if (price <= 0) return setError("Enter a price in rupees.");
        if (days.some((d) => !d.location.trim())) return setError("Every day needs a place.");

        setSaving(true);
        try {
            await adminCall("updateTrip", {
                id: params.tripId,
                trip: { ...trip, estimatedPrice: money(price), duration: days.length },
            });
            navigate(`/trips/${params.tripId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not save the trip.");
            setSaving(false);
        }
    };

    return (
        <main className="dashboard wrapper">
            <form onSubmit={save} className="flex flex-col gap-6">
                <span className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <span className="flex flex-col gap-2">
                        <Link to={`/trips/${params.tripId}`} className="flex items-center gap-2 text-sm font-medium text-gray-100 hover:text-primary-100 w-fit">
                            <ArrowLeft size={16} /> Back to trip
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-dark-100">Edit trip</h1>
                        <p className="text-sm text-gray-100">Change any detail. All prices are in Indian Rupees.</p>
                    </span>
                </span>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        <Card title="Basics">
                            <label className={label}>
                                Trip name
                                <input value={trip.name} onChange={(e) => set("name", e.target.value)} className={input} maxLength={150} />
                            </label>
                            <label className={label}>
                                Description
                                <textarea value={trip.description} onChange={(e) => set("description", e.target.value)} rows={4} className={cn(input, "h-auto py-3 leading-6 resize-y")} />
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <label className={label}>
                                    State or union territory
                                    <Select value={trip.state ?? ""} options={indianStates} onChange={(v) => set("state", v)} placeholder="Choose a state" />
                                </label>
                                <label className={label}>
                                    Main city or area
                                    <input
                                        value={trip.location?.city ?? ""}
                                        onChange={(e) => set("location", { ...trip.location, city: e.target.value } as Location)}
                                        placeholder="e.g. Jaipur"
                                        className={input}
                                    />
                                </label>
                            </div>
                        </Card>

                        <Card title="Itinerary" subtitle={`${days.length} ${days.length === 1 ? "day" : "days"}. The trip length follows the number of days.`}>
                            <ol className="flex flex-col gap-4">
                                {days.map((d, di) => (
                                    <li key={di} className="rounded-2xl border border-light-400 bg-light-200/60 p-4 flex flex-col gap-3">
                                        <span className="flex items-center gap-3">
                                            <span className="shrink-0 rounded-lg bg-primary-100 text-white text-xs font-bold px-2.5 py-1.5">Day {di + 1}</span>
                                            <span className="relative flex-1">
                                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-100" />
                                                <input
                                                    value={d.location}
                                                    onChange={(e) => updateDay(di, { location: e.target.value })}
                                                    placeholder="Place for this day"
                                                    className={cn(input, "pl-9")}
                                                />
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setDays(days.filter((_, j) => j !== di))}
                                                disabled={days.length === 1}
                                                aria-label={`Remove day ${di + 1}`}
                                                className="size-10 shrink-0 rounded-xl flex items-center justify-center text-gray-100 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </span>

                                        <ul className="flex flex-col gap-2 sm:pl-16">
                                            {d.activities.map((a, ai) => (
                                                <li key={ai} className="flex items-center gap-2">
                                                    <input
                                                        value={a.time}
                                                        onChange={(e) => updateActivity(di, ai, { time: e.target.value })}
                                                        placeholder="09:00 AM"
                                                        className={cn(input, "w-28 shrink-0 h-10")}
                                                    />
                                                    <input
                                                        value={a.description}
                                                        onChange={(e) => updateActivity(di, ai, { description: e.target.value })}
                                                        placeholder="What happens"
                                                        className={cn(input, "h-10")}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateDay(di, { activities: d.activities.filter((_, j) => j !== ai) })}
                                                        aria-label="Remove activity"
                                                        className="size-9 shrink-0 rounded-lg flex items-center justify-center text-gray-100 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </li>
                                            ))}
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={() => updateDay(di, { activities: [...d.activities, { time: "", description: "" }] })}
                                                    className="flex items-center gap-1.5 text-sm font-semibold text-primary-100 hover:underline cursor-pointer"
                                                >
                                                    <Plus size={15} /> Add activity
                                                </button>
                                            </li>
                                        </ul>
                                    </li>
                                ))}
                            </ol>
                            <button
                                type="button"
                                onClick={() => setDays([...days, { day: days.length + 1, location: days[days.length - 1]?.location ?? "", activities: [{ time: "09:00 AM", description: "" }] }])}
                                className="flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-light-400 text-sm font-semibold text-gray-100 hover:border-primary-100 hover:text-primary-100 transition-colors cursor-pointer"
                            >
                                <Plus size={16} /> Add day
                            </button>
                        </Card>

                        <Card title="Season and weather" subtitle="One item per line.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <label className={label}>
                                    Best time to visit
                                    <textarea
                                        value={(trip.bestTimeToVisit ?? []).join("\n")}
                                        onChange={(e) => set("bestTimeToVisit", e.target.value.split("\n"))}
                                        rows={4}
                                        placeholder="October to March: pleasant weather"
                                        className={cn(input, "h-auto py-3 leading-6")}
                                    />
                                </label>
                                <label className={label}>
                                    Weather
                                    <textarea
                                        value={(trip.weatherInfo ?? []).join("\n")}
                                        onChange={(e) => set("weatherInfo", e.target.value.split("\n"))}
                                        rows={4}
                                        placeholder="Winter: 10°C - 25°C"
                                        className={cn(input, "h-auto py-3 leading-6")}
                                    />
                                </label>
                            </div>
                        </Card>
                    </div>

                    {/* Side column */}
                    <div className="flex flex-col gap-6 xl:sticky xl:top-6">
                        <Card title="Price and type">
                            <label className={label}>
                                Estimated price (₹, whole group)
                                <span className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-100 font-semibold">₹</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step={500}
                                        value={price || ""}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className={cn(input, "pl-9 tabular-nums")}
                                    />
                                </span>
                                <small className="text-xs font-normal text-gray-100">Shown as {money(price)}</small>
                            </label>
                            <label className={label}>
                                Travel style
                                <Select value={trip.travelStyle} options={travelStyles} onChange={(v) => set("travelStyle", v)} placeholder="Choose a style" />
                            </label>
                            <label className={label}>
                                Group type
                                <Select value={trip.groupType} options={groupTypes} onChange={(v) => set("groupType", v)} placeholder="Who is travelling?" />
                            </label>
                            <label className={label}>
                                Budget level
                                <Select value={trip.budget} options={budgetOptions} onChange={(v) => set("budget", v)} placeholder="Choose a budget" />
                            </label>
                        </Card>
                        <Card title="Interests">
                            <ul className="flex flex-wrap gap-2">
                                {[...new Set([...INTERESTS, ...chosenInterests])].map((i) => {
                                    const on = chosenInterests.includes(i);
                                    return (
                                        <li key={i}>
                                            <button
                                                type="button"
                                                onClick={() => toggleInterest(i)}
                                                aria-pressed={on}
                                                className={cn(
                                                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer",
                                                    on ? "bg-primary-100 border-primary-100 text-white" : "bg-white border-light-400 text-dark-200 hover:border-primary-100"
                                                )}
                                            >
                                                {on && <Check size={13} />} {i}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Card>

                        <Card title="Cover image">
                            <ul className="grid grid-cols-4 gap-2">
                                {IMAGES.map((url) => (
                                    <li key={url}>
                                        <button
                                            type="button"
                                            onClick={() => setCover(url)}
                                            aria-label="Use this image as cover"
                                            aria-pressed={cover === url}
                                            className={cn(
                                                "relative block w-full aspect-square overflow-hidden rounded-xl ring-offset-2 transition-all cursor-pointer",
                                                cover === url ? "ring-3 ring-primary-100" : "opacity-80 hover:opacity-100"
                                            )}
                                        >
                                            <img src={url} alt="" className="size-full object-cover" />
                                            {cover === url && (
                                                <span className="absolute inset-0 bg-primary-100/30 flex items-center justify-center text-white">
                                                    <Check size={20} />
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>

                {/* Save bar */}
                <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur rounded-2xl border border-light-400 shadow-xl px-5 py-4">
                    {error ? <p className="text-sm text-red-500">{error}</p> : <p className="text-sm text-gray-100">Changes are saved to the database for everyone.</p>}
                    <span className="flex gap-3">
                        <Link to={`/trips/${params.tripId}`} className="h-11 px-6 rounded-xl border border-light-400 text-dark-100 font-medium flex items-center hover:bg-light-200">
                            Cancel
                        </Link>
                        <button type="submit" disabled={saving} className="h-11 px-6 rounded-xl bg-primary-100 hover:bg-primary-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-primary-100/30 cursor-pointer disabled:opacity-60">
                            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </span>
                </div>
            </form>
        </main>
    );
};

export default EditTrip;

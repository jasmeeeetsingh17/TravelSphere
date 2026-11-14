import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useRevalidator, useSearchParams } from "react-router";
import dayjs from "dayjs";
import {
    CalendarCheck, CheckCircle2, Clock, DatabaseZap, Globe, Loader2, Mail, Phone, Plus, RotateCcw, Search, Trash2, UserRound, Users, Wallet, XCircle,
} from "lucide-react";
import { Header } from "../../../components";
import KpiCard from "../../../components/KpiCard";
import Modal from "../../../components/Modal";
import { adminCall, loadBookings } from "~/appwrite/admin";
import { getSavedTrips } from "~/appwrite/trips";
import { dummyTrips } from "~/constants/dummyTrips";
import { MAX_TRAVELLERS, pricePerPerson, type Booking, type BookingStatus } from "~/lib/booking";
import { cn, money } from "~/lib/utils";
import type { Route } from "./+types/bookings";

export const meta = () => [{ title: "Bookings | TravelSphere Admin" }];

export const clientLoader = async () => {
    const [data, trips] = await Promise.all([loadBookings(), getSavedTrips(200)]);
    return { ...data, trips };
};

const STATUS_STYLE: Record<BookingStatus, string> = {
    Pending: "bg-amber-50 text-amber-600",
    Confirmed: "bg-success-50 text-success-700",
    Cancelled: "bg-light-300 text-gray-500",
};
const TABS = ["All", "Pending", "Confirmed", "Cancelled"] as const;
type Tab = (typeof TABS)[number];

const input = "h-11 w-full rounded-xl border border-light-400 bg-white px-4 text-sm text-dark-100 outline-none focus:border-primary-100 focus:ring-2 focus:ring-primary-100/15";
const label = "flex flex-col gap-1.5 text-sm font-medium text-dark-100";
const fmt = (d: string) => (d ? dayjs(d).format("D MMM YYYY") : "-");

/* ---------------- First-time setup ---------------- */
const SetupCard = ({ onDone }: { onDone: () => void }) => {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const run = async () => {
        setBusy(true);
        setError("");
        try {
            await adminCall("setupBookings");
            // Appwrite builds the new fields in the background; give it a moment
            await new Promise((r) => setTimeout(r, 2500));
            onDone();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Set up failed.");
        } finally {
            setBusy(false);
        }
    };
    return (
        <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-8 md:p-12 flex flex-col items-center text-center gap-5">
            <span className="size-16 rounded-2xl bg-primary-50 text-primary-100 flex items-center justify-center">
                <DatabaseZap size={30} />
            </span>
            <span className="flex flex-col gap-2 max-w-lg">
                <h2 className="text-xl font-semibold text-dark-100">Set up bookings</h2>
                <p className="text-gray-100 leading-7">
                    Bookings are saved in their own Appwrite collection. Click below and the app creates the <code className="bg-light-200 px-1.5 rounded">bookings</code> collection for you. Customer details stay private: only the server can read them.
                </p>
            </span>
            {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm max-w-lg">{error}</p>}
            <button onClick={run} disabled={busy} className="flex items-center gap-2 h-12 px-7 rounded-xl bg-primary-100 hover:bg-primary-500 text-white font-semibold shadow-lg shadow-primary-100/30 disabled:opacity-60 cursor-pointer">
                {busy ? <Loader2 size={18} className="animate-spin" /> : <DatabaseZap size={18} />}
                {busy ? "Setting up..." : "Set up bookings"}
            </button>
            <small className="text-xs text-gray-100 max-w-md">Needs the API key scopes collections.write and attributes.write. Safe to click more than once.</small>
        </section>
    );
};

/* ---------------- Add booking (phone / walk-in) ---------------- */
const AddBooking = ({ trips, onSaved, startOpen = false }: { trips: { id: string; name: string; price: string; group: string }[]; onSaved: (msg: string) => void; startOpen?: boolean }) => {
    const [open, setOpen] = useState(startOpen);
    // The sidebar's "Add booking" link opens the form even when already on this page
    useEffect(() => {
        if (startOpen) setOpen(true);
    }, [startOpen]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [f, setF] = useState({ tripId: "", customerName: "", phone: "", email: "", travelDate: dayjs().add(14, "day").format("YYYY-MM-DD"), travellers: 2, status: "Confirmed", notes: "" });
    const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: k === "travellers" ? Number(e.target.value) : e.target.value }));
    const trip = trips.find((t) => t.id === f.tripId);

    const save = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            await adminCall("createBooking", { ...f, phone: f.phone.replace(/[\s-]/g, "") });
            setOpen(false);
            onSaved(`Booking for ${f.customerName} added.`);
            setF((x) => ({ ...x, customerName: "", phone: "", email: "", notes: "" }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not add the booking.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <button onClick={() => setOpen(true)} className="flex items-center justify-center gap-2 bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-6 py-3 shadow-md shadow-primary-100/30 transition-colors cursor-pointer shrink-0">
                <Plus size={16} /> Add booking
            </button>
            <Modal open={open} title="Add a booking" onClose={() => !busy && setOpen(false)}>
                <form onSubmit={save} className="flex flex-col gap-4">
                    <label className={label}>
                        Trip
                        <select value={f.tripId} onChange={set("tripId")} required className={cn(input, "cursor-pointer")}>
                            <option value="">Choose a trip</option>
                            {trips.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className={label}>Customer name<input value={f.customerName} onChange={set("customerName")} required className={input} /></label>
                        <label className={label}>Phone<input value={f.phone} onChange={set("phone")} type="tel" required className={input} /></label>
                        <label className={label}>Email<input value={f.email} onChange={set("email")} type="email" className={input} /></label>
                        <label className={label}>Travel date<input value={f.travelDate} onChange={set("travelDate")} type="date" required className={input} /></label>
                        <label className={label}>Travellers<input value={f.travellers} onChange={set("travellers")} type="number" min={1} max={MAX_TRAVELLERS} required className={input} /></label>
                        <label className={label}>
                            Status
                            <select value={f.status} onChange={set("status")} className={cn(input, "cursor-pointer")}>
                                <option>Confirmed</option>
                                <option>Pending</option>
                            </select>
                        </label>
                    </div>
                    <label className={label}>Notes<textarea value={f.notes} onChange={set("notes")} rows={2} maxLength={500} className={cn(input, "h-auto py-3")} /></label>
                    {trip && (
                        <p className="flex justify-between rounded-xl bg-light-200 px-4 py-3 text-sm">
                            <span className="text-gray-100">{money(pricePerPerson(trip))} × {f.travellers}</span>
                            <strong className="text-dark-100">{money(pricePerPerson(trip) * (f.travellers || 0))}</strong>
                        </p>
                    )}
                    {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{error}</p>}
                    <button type="submit" disabled={busy} className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary-100 hover:bg-primary-500 text-white font-semibold disabled:opacity-60 cursor-pointer">
                        {busy && <Loader2 size={16} className="animate-spin" />} {busy ? "Saving..." : "Save booking"}
                    </button>
                </form>
            </Modal>
        </>
    );
};

/* ---------------- Page ---------------- */
const Bookings = ({ loaderData }: Route.ComponentProps) => {
    const { bookings, ready, error, trips } = loaderData;
    const revalidator = useRevalidator();
    // Sidebar links: /bookings?status=Pending opens that tab, /bookings?new=1 opens "Add booking"
    const [params] = useSearchParams();
    const statusParam = TABS.find((t) => t.toLowerCase() === (params.get("status") ?? "").toLowerCase()) ?? "All";
    const [tab, setTab] = useState<Tab>(statusParam);
    useEffect(() => setTab(statusParam), [statusParam]);
    const [query, setQuery] = useState("");
    const [busyId, setBusyId] = useState("");
    const [notice, setNotice] = useState("");
    const [actionError, setActionError] = useState("");
    const [toDelete, setToDelete] = useState<Booking | null>(null);

    const bookable = useMemo(
        () => [
            ...trips.map((t) => ({ id: t.id, name: t.name, price: t.price, group: t.group })),
            ...dummyTrips.map((t) => ({ id: t.id, name: `${t.name} (website)`, price: t.price, group: t.group })),
        ],
        [trips]
    );

    const counts = useMemo(() => {
        const c: Record<Tab, number> = { All: bookings.length, Pending: 0, Confirmed: 0, Cancelled: 0 };
        for (const b of bookings) c[b.status]++;
        return c;
    }, [bookings]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return bookings.filter(
            (b) =>
                (tab === "All" || b.status === tab) &&
                (!q || [b.customerName, b.phone, b.email, b.tripName, b.tripState].join(" ").toLowerCase().includes(q))
        );
    }, [bookings, tab, query]);

    const confirmed = bookings.filter((b) => b.status === "Confirmed");
    const revenue = confirmed.reduce((s, b) => s + b.amount, 0);
    const people = bookings.filter((b) => b.status !== "Cancelled").reduce((s, b) => s + b.travellers, 0);
    const pendingValue = bookings.filter((b) => b.status === "Pending").reduce((s, b) => s + b.amount, 0);

    const refresh = (msg: string) => {
        setNotice(msg);
        revalidator.revalidate();
    };

    const setStatus = async (b: Booking, status: BookingStatus) => {
        setBusyId(b.id);
        setActionError("");
        try {
            await adminCall("setBookingStatus", { id: b.id, status });
            refresh(`${b.customerName}'s booking is now ${status.toLowerCase()}.`);
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Could not update the booking.");
        } finally {
            setBusyId("");
        }
    };

    const remove = async () => {
        if (!toDelete) return;
        setBusyId(toDelete.id);
        setActionError("");
        try {
            await adminCall("deleteBooking", { id: toDelete.id });
            refresh(`Booking for ${toDelete.customerName} deleted.`);
            setToDelete(null);
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Could not delete the booking.");
        } finally {
            setBusyId("");
        }
    };

    if (!ready) {
        return (
            <main className="dashboard wrapper">
                <Header title="Bookings" description="Booking requests from the website and bookings you add yourself." />
                <SetupCard onDone={() => refresh("Bookings are ready. New requests from the website will appear here.")} />
            </main>
        );
    }

    return (
        <main className="dashboard wrapper">
            <span className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <Header title="Bookings" description="Booking requests from the website and bookings you add yourself." />
                <AddBooking trips={bookable} onSaved={refresh} startOpen={params.get("new") === "1"} />
            </span>

            {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">Bookings could not be loaded: {error}</p>}

            <ul className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard label="Total bookings" value={bookings.length} note={`${people} travellers`} Icon={CalendarCheck} tone="bg-primary-50 text-primary-100" />
                <KpiCard label="Waiting for you" value={counts.Pending} note={`${money(pendingValue)} to confirm`} Icon={Clock} tone="bg-amber-50 text-amber-600" />
                <KpiCard label="Confirmed revenue" value={money(revenue)} note={`${counts.Confirmed} confirmed`} Icon={Wallet} tone="bg-success-50 text-success-700" />
                <KpiCard label="Cancelled" value={counts.Cancelled} note={bookings.length ? `${Math.round((counts.Cancelled / bookings.length) * 100)}% of all bookings` : "None yet"} Icon={XCircle} tone="bg-pink-50 text-pink-500" />
            </ul>

            {notice && <p className="rounded-xl bg-success-50 text-success-700 px-4 py-3 text-sm">{notice}</p>}
            {actionError && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{actionError}</p>}

            <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-4 md:p-6 flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1 bg-light-200 rounded-full p-1 w-fit" role="tablist">
                        {TABS.map((t) => (
                            <button
                                key={t}
                                role="tab"
                                aria-selected={tab === t}
                                onClick={() => setTab(t)}
                                className={cn("rounded-full px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer", tab === t ? "bg-white text-dark-100 shadow" : "text-gray-100 hover:text-dark-100")}
                            >
                                {t} <span className="text-xs text-gray-100">{counts[t]}</span>
                            </button>
                        ))}
                    </div>
                    <span className="relative lg:w-80">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-100" />
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, trip..." className={cn(input, "pl-10")} />
                    </span>
                </div>

                {visible.length ? (
                    <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
                        <table className="w-full min-w-[980px] text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-gray-100 border-b border-light-400">
                                    <th className="py-3 pr-3 font-semibold">Customer</th>
                                    <th className="py-3 pr-3 font-semibold">Trip</th>
                                    <th className="py-3 pr-3 font-semibold">Travel date</th>
                                    <th className="py-3 pr-3 font-semibold text-right">People</th>
                                    <th className="py-3 pr-3 font-semibold text-right">Amount</th>
                                    <th className="py-3 pr-3 font-semibold">Status</th>
                                    <th className="py-3 pr-3 font-semibold">Received</th>
                                    <th className="py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-400">
                                {visible.map((b) => (
                                    <tr key={b.id} className="align-top hover:bg-light-200/60">
                                        <td className="py-3.5 pr-3">
                                            <strong className="flex items-center gap-1.5 text-dark-100"><UserRound size={14} className="text-gray-100" /> {b.customerName}</strong>
                                            <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 text-xs text-gray-100 hover:text-primary-100"><Phone size={12} /> {b.phone}</a>
                                            {b.email && <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 text-xs text-gray-100 hover:text-primary-100 break-all"><Mail size={12} /> {b.email}</a>}
                                            {b.notes && <small className="block mt-1 text-xs text-dark-200 bg-light-200 rounded-lg px-2 py-1 max-w-56">"{b.notes}"</small>}
                                        </td>
                                        <td className="py-3.5 pr-3">
                                            <span className="font-medium text-dark-100">{b.tripName}</span>
                                            <small className="block text-gray-100">{[b.tripState, b.tripBudget, b.tripDays ? `${b.tripDays} days` : ""].filter(Boolean).join(" · ")}</small>
                                        </td>
                                        <td className="py-3.5 pr-3 whitespace-nowrap text-dark-100">{fmt(b.travelDate)}</td>
                                        <td className="py-3.5 pr-3 text-right tabular-nums text-dark-100">{b.travellers}</td>
                                        <td className="py-3.5 pr-3 text-right tabular-nums font-semibold text-dark-100">{money(b.amount)}</td>
                                        <td className="py-3.5 pr-3">
                                            <span className={cn("text-xs font-semibold rounded-full px-2.5 py-1 whitespace-nowrap", STATUS_STYLE[b.status])}>{b.status}</span>
                                        </td>
                                        <td className="py-3.5 pr-3 whitespace-nowrap text-xs text-gray-100">
                                            {fmt(b.createdAt)}
                                            <span className="flex items-center gap-1 mt-0.5">{b.source === "website" ? <><Globe size={11} /> Website</> : <><Users size={11} /> Added by admin</>}</span>
                                        </td>
                                        <td className="py-3.5">
                                            <span className="flex justify-end gap-1">
                                                {busyId === b.id ? (
                                                    <Loader2 size={18} className="animate-spin text-primary-100 m-2" />
                                                ) : (
                                                    <>
                                                        {b.status !== "Confirmed" && (
                                                            <button onClick={() => setStatus(b, "Confirmed")} title="Confirm" className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-success-700 hover:bg-success-50 cursor-pointer">
                                                                <CheckCircle2 size={15} /> Confirm
                                                            </button>
                                                        )}
                                                        {b.status !== "Cancelled" ? (
                                                            <button onClick={() => setStatus(b, "Cancelled")} title="Cancel" className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-100 hover:bg-light-300 cursor-pointer">
                                                                <XCircle size={15} /> Cancel
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => setStatus(b, "Pending")} title="Reopen" className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 cursor-pointer">
                                                                <RotateCcw size={15} /> Reopen
                                                            </button>
                                                        )}
                                                        <button onClick={() => setToDelete(b)} aria-label="Delete booking" className="rounded-lg p-1.5 text-gray-100 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center py-14 bg-light-200 rounded-2xl">
                        <CalendarCheck size={32} className="text-gray-100" />
                        <p className="text-gray-100">
                            {bookings.length ? "No bookings match this filter." : "No bookings yet. Requests sent from the trip pages on the website will show up here."}
                        </p>
                        {!bookings.length && <Link to="/travel" target="_blank" className="text-sm font-semibold text-primary-100 hover:underline">Open the website</Link>}
                    </div>
                )}
            </section>

            <Modal open={!!toDelete} title="Delete this booking?" onClose={() => !busyId && setToDelete(null)}>
                <p className="text-gray-100 leading-7">
                    The booking for <strong className="text-dark-100">{toDelete?.customerName}</strong> ({toDelete?.tripName}) will be removed permanently. To keep a record, cancel it instead.
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setToDelete(null)} className="h-11 px-6 rounded-xl border border-light-400 text-dark-100 font-medium hover:bg-light-200 cursor-pointer">Keep it</button>
                    <button onClick={remove} disabled={!!busyId} className="h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-60">
                        {busyId && <Loader2 size={16} className="animate-spin" />} Delete booking
                    </button>
                </div>
            </Modal>
        </main>
    );
};

export default Bookings;

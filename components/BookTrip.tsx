import { useState, type FormEvent } from "react";
import { CalendarCheck, CheckCircle2, Loader2, Minus, Plus, ShieldCheck } from "lucide-react";
import { MAX_TRAVELLERS, pricePerPerson } from "~/lib/booking";
import type { TripView } from "~/lib/trip-view";
import { money } from "~/lib/utils";
import Modal from "./Modal";

const input = "h-11 w-full rounded-xl border border-light-400 bg-surface px-4 text-sm text-dark-100 outline-none focus:border-primary-100 focus:ring-2 focus:ring-primary-100/15";
const label = "flex flex-col gap-1.5 text-sm font-medium text-dark-100";

const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/** "Book this trip" button and form for the public trip page. No sign-in needed. */
const BookTrip = ({ trip }: { trip: TripView }) => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ customerName: "", phone: "", email: "", travelDate: inDays(14), notes: "", company: "" });
    const [travellers, setTravellers] = useState(2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState<{ reference: string; amount: number } | null>(null);

    const perPerson = pricePerPerson(trip);
    const total = perPerson * travellers;
    const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const close = () => {
        if (loading) return;
        setOpen(false);
        setError("");
        if (done) {
            setDone(null);
            setForm((f) => ({ ...f, notes: "" }));
        }
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (form.customerName.trim().length < 2) return setError("Please enter your full name.");
        if (!/^\+?\d{10,13}$/.test(form.phone.replace(/[\s-]/g, ""))) return setError("Please enter a valid 10-digit phone number.");
        if (form.travelDate < inDays(1)) return setError("Please pick a date from tomorrow onwards.");

        setLoading(true);
        try {
            const res = await fetch("/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, phone: form.phone.replace(/[\s-]/g, ""), travellers, tripId: trip.id }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? "Could not send your booking.");
            setDone({ reference: data.reference ?? "", amount: data.amount ?? total });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not send your booking.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-1 rounded-2xl bg-light-200 p-4">
                <small className="text-gray-100">From</small>
                <strong className="text-2xl font-bold text-dark-100">
                    {money(perPerson)} <small className="text-sm font-medium text-gray-100">per person</small>
                </strong>
            </div>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary-100 hover:bg-primary-500 text-white font-semibold shadow-lg shadow-primary-100/30 transition-colors cursor-pointer"
            >
                <CalendarCheck size={18} /> Book this trip
            </button>
            <small className="flex items-center justify-center gap-1.5 text-xs text-gray-100">
                <ShieldCheck size={14} className="text-success-700" /> No payment now. We call you to confirm.
            </small>

            <Modal open={open} title={done ? "Booking request sent" : `Book: ${trip.name}`} onClose={close}>
                {done ? (
                    <div className="flex flex-col items-center gap-4 text-center py-2">
                        <CheckCircle2 size={52} className="text-success-700" />
                        <p className="text-gray-100 leading-7">
                            Thank you, <strong className="text-dark-100">{form.customerName.split(" ")[0]}</strong>! We have your request for{" "}
                            <strong className="text-dark-100">{travellers} {travellers === 1 ? "traveller" : "travellers"}</strong> on{" "}
                            <strong className="text-dark-100">{new Date(form.travelDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>.
                            Our team will call you on {form.phone} within 24 hours to confirm.
                        </p>
                        <span className="rounded-xl bg-light-200 px-5 py-3 text-sm">
                            Reference <strong className="text-dark-100 tracking-wider">#{done.reference}</strong> · Estimated {money(done.amount)}
                        </span>
                        <button onClick={close} className="bg-primary-100 hover:bg-primary-500 text-white font-semibold rounded-full px-7 py-2.5 cursor-pointer">
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={label}>
                                Full name
                                <input value={form.customerName} onChange={set("customerName")} autoComplete="name" required className={input} />
                            </label>
                            <label className={label}>
                                Phone
                                <input value={form.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" required className={input} />
                            </label>
                            <label className={label}>
                                <span>Email <small className="font-normal text-gray-100">(optional)</small></span>
                                <input value={form.email} onChange={set("email")} type="email" autoComplete="email" className={input} />
                            </label>
                            <label className={label}>
                                Travel date
                                <input value={form.travelDate} onChange={set("travelDate")} type="date" min={inDays(1)} required className={input} />
                            </label>
                        </div>

                        <div className={label}>
                            Travellers
                            <span className="flex items-center gap-3">
                                <button type="button" onClick={() => setTravellers((n) => Math.max(1, n - 1))} aria-label="Fewer travellers" className="size-11 rounded-xl border border-light-400 flex items-center justify-center hover:border-primary-100 cursor-pointer">
                                    <Minus size={16} />
                                </button>
                                <strong className="w-10 text-center text-xl tabular-nums">{travellers}</strong>
                                <button type="button" onClick={() => setTravellers((n) => Math.min(MAX_TRAVELLERS, n + 1))} aria-label="More travellers" className="size-11 rounded-xl border border-light-400 flex items-center justify-center hover:border-primary-100 cursor-pointer">
                                    <Plus size={16} />
                                </button>
                            </span>
                        </div>

                        <label className={label}>
                            <span>Anything we should know? <small className="font-normal text-gray-100">(optional)</small></span>
                            <textarea value={form.notes} onChange={set("notes")} rows={2} maxLength={500} placeholder="Room preferences, food, pickup city..." className={`${input} h-auto py-3`} />
                        </label>

                        {/* Hidden from people, filled in by bots */}
                        <input value={form.company} onChange={set("company")} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="company" />

                        <p className="flex items-center justify-between rounded-xl bg-light-200 px-4 py-3 text-sm">
                            <span className="text-gray-100">
                                {money(perPerson)} × {travellers} {travellers === 1 ? "traveller" : "travellers"}
                            </span>
                            <strong className="text-lg text-dark-100">{money(total)}</strong>
                        </p>

                        {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{error}</p>}

                        <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary-100 hover:bg-primary-500 text-white font-semibold disabled:opacity-60 cursor-pointer">
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {loading ? "Sending..." : "Send booking request"}
                        </button>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default BookTrip;

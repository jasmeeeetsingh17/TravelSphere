import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import { createBooking } from "~/appwrite/bookings";
import { money, priceToNumber } from "~/lib/booking";
import type { TripView } from "~/lib/trip-view";
import Modal from "./Modal";

export type BookingUser = { accountId: string; name: string; email: string };

const inputClass = "h-11 rounded-xl border border-light-400 px-4 text-dark-100 outline-none focus:border-primary-100 w-full";

const tomorrow = () => new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

/** "Book this trip" button with a small form. Needs a signed-in user. */
const BookTrip = ({ trip, user }: { trip: TripView; user: BookingUser | null }) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(tomorrow());
    const [guests, setGuests] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    if (!user) {
        return (
            <Link to="/sign-in" className="flex items-center justify-center gap-2 h-11 rounded-xl border border-primary-100 text-primary-100 font-semibold hover:bg-primary-50 transition-colors">
                <CalendarCheck size={18} /> Sign in to book
            </Link>
        );
    }

    const total = priceToNumber(trip.price) * guests;

    const close = () => {
        setOpen(false);
        setDone(false);
        setError("");
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (!date || date < tomorrow()) return setError("Please pick a future travel date.");
        if (guests < 1 || guests > 10) return setError("Guests must be between 1 and 10.");

        setLoading(true);
        try {
            await createBooking({
                tripId: trip.id,
                tripName: trip.name,
                userId: user.accountId,
                userName: user.name,
                userEmail: user.email,
                travelDate: date,
                guests,
                amount: total,
            });
            setDone(true);
        } catch (err) {
            console.error("Booking failed:", err);
            setError(`Could not create the booking. ${err instanceof Error ? err.message : ""}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ButtonComponent type="button" className="button-class h-11 w-full" onClick={() => setOpen(true)}>
                <CalendarCheck size={18} className="text-white mr-2" />
                <span className="text-white font-semibold">Book this trip</span>
            </ButtonComponent>

            <Modal open={open} title={done ? "Booking requested" : "Book this trip"} onClose={close}>
                {done ? (
                    <div className="flex flex-col items-center gap-4 text-center py-2">
                        <CheckCircle2 size={48} className="text-success-700" />
                        <p className="text-gray-100">
                            Your booking for <strong className="text-dark-100">{trip.name}</strong> is waiting for confirmation. You can follow its status in your account.
                        </p>
                        <Link to="/account" className="bg-primary-100 hover:bg-primary-500 text-white font-semibold rounded-full px-6 py-2.5 transition-colors">
                            View my bookings
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <label className="flex flex-col gap-2 text-sm font-medium text-dark-100">
                            Travel date
                            <input type="date" min={tomorrow()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-dark-100">
                            Guests
                            <input type="number" min={1} max={10} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={inputClass} />
                        </label>

                        <p className="flex items-center justify-between rounded-xl bg-light-200 px-4 py-3 text-sm">
                            <span className="text-gray-100">{trip.price} x {guests} {guests === 1 ? "guest" : "guests"}</span>
                            <strong className="text-lg text-dark-100">{money(total)}</strong>
                        </p>

                        {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{error}</p>}

                        <ButtonComponent type="submit" disabled={loading} className="button-class h-11 w-full">
                            {loading && <Loader2 size={18} className="animate-spin text-white mr-2" />}
                            <span className="text-white font-semibold">{loading ? "Booking..." : "Confirm booking request"}</span>
                        </ButtonComponent>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default BookTrip;

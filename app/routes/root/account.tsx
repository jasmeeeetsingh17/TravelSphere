import { Link, redirect, useNavigate } from "react-router";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { CalendarDays, LayoutDashboard, LogOut, Mail, Plus, ShieldCheck } from "lucide-react";
import { Header, TripCard } from "../../../components";
import { getExistingUser, getUser, logoutUser } from "~/appwrite/auth";
import { getMyBookings } from "~/appwrite/bookings";
import { getSavedTrips } from "~/appwrite/trips";
import { money, type BookingStatus } from "~/lib/booking";
import { cn, formatDate } from "~/lib/utils";
import type { Route } from "./+types/account";

export const clientLoader = async () => {
    const user = await getUser();
    if (!user || user instanceof Response) return redirect("/sign-in");

    const [existing, trips, bookings] = await Promise.all([
        getExistingUser(user.accountId),
        getSavedTrips(24, user.accountId),
        getMyBookings(user.accountId),
    ]);

    return {
        name: user.name as string,
        email: user.email as string,
        imageUrl: (user.imageUrl as string) || "/assets/images/david.webp",
        joinedAt: user.joinedAt as string,
        isAdmin: existing?.status === "admin",
        trips,
        bookings,
    };
};

const statusStyles: Record<BookingStatus, string> = {
    Confirmed: "bg-success-50 text-success-700",
    Pending: "bg-amber-50 text-amber-600",
    Cancelled: "bg-light-300 text-gray-500",
};

type Data = Exclude<Awaited<ReturnType<typeof clientLoader>>, Response>;

const Account = ({ loaderData }: Route.ComponentProps) => {
    const { name, email, imageUrl, joinedAt, isAdmin, trips, bookings } = loaderData as Data;
    const navigate = useNavigate();

    const signOut = async () => {
        await logoutUser();
        navigate("/sign-in");
    };

    return (
        <main className="wrapper pt-28 pb-20 flex flex-col gap-10">
            <Header title="My Account" description="Your profile and the trips you have created." />

            <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
                <img
                    src={imageUrl}
                    alt={name}
                    referrerPolicy="no-referrer"
                    className="size-28 rounded-full aspect-square object-cover border-4 border-primary-50"
                />

                <div className="flex-1 flex flex-col gap-3">
                    <span className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-bold text-dark-100">{name}</h2>
                        <span className="flex items-center gap-1.5 bg-primary-50 text-primary-100 text-xs font-semibold rounded-full px-3 py-1">
                            <ShieldCheck size={14} /> {isAdmin ? "Admin" : "Traveller"}
                        </span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-100"><Mail size={16} /> {email}</span>
                    <span className="flex items-center gap-2 text-gray-100"><CalendarDays size={16} /> Member since {formatDate(joinedAt)}</span>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-3">
                    {isAdmin && (
                        <Link to="/dashboard" className="flex items-center justify-center gap-2 bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-6 py-3 transition-colors">
                            <LayoutDashboard size={16} /> Open dashboard
                        </Link>
                    )}
                    <ButtonComponent type="button" className="h-11 px-6" onClick={signOut}>
                        <LogOut size={16} className="mr-2" /> Sign out
                    </ButtonComponent>
                </div>
            </section>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <li className="bg-white rounded-20 shadow-400 p-6 flex flex-col gap-1">
                    <span className="text-sm text-gray-100">Trips created</span>
                    <strong className="text-3xl font-bold text-dark-100">{trips.length}</strong>
                </li>
                <li className="bg-white rounded-20 shadow-400 p-6 flex flex-col gap-1">
                    <span className="text-sm text-gray-100">Bookings made</span>
                    <strong className="text-3xl font-bold text-dark-100">{bookings.length}</strong>
                </li>
            </ul>

            <section className="flex flex-col gap-6">
                <h2 className="text-xl font-semibold text-dark-100">My bookings</h2>

                {bookings.length ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings.map((b) => (
                            <li key={b.id} className="bg-white rounded-2xl border border-light-400 p-5 flex flex-col gap-3">
                                <span className="flex items-start justify-between gap-3">
                                    <Link to={`/travel/${b.tripId}`} className="font-semibold text-dark-100 hover:text-primary-100">{b.tripName}</Link>
                                    <span className={cn("px-3 py-1 rounded-full text-xs font-medium shrink-0", statusStyles[b.status])}>{b.status}</span>
                                </span>
                                <span className="text-sm text-gray-100">
                                    {formatDate(b.travelDate)} · {b.guests} {b.guests === 1 ? "guest" : "guests"} · <strong className="text-dark-100">{money(b.amount)}</strong>
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="bg-white rounded-3xl border border-light-400 text-center text-gray-100 py-10">
                        No bookings yet. Open a trip and press <strong>Book this trip</strong>.
                    </p>
                )}
            </section>

            <section className="flex flex-col gap-6">
                <span className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-dark-100">My trips</h2>
                    <Link to="/plan" className="flex items-center gap-2 text-primary-100 font-semibold text-sm hover:underline">
                        <Plus size={16} /> Plan a new trip
                    </Link>
                </span>

                {trips.length ? (
                    <div className="trip-grid">
                        {trips.map((t) => (
                            <TripCard key={t.id} id={t.id} name={t.name} imageUrl={t.imageUrl} location={t.location} tags={t.tags} price="" />
                        ))}
                    </div>
                ) : (
                    <p className="bg-white rounded-3xl border border-light-400 text-center text-gray-100 py-14">
                        You have not created any trips yet.{" "}
                        <Link to="/plan" className="text-primary-100 font-semibold">Plan your first trip</Link>
                    </p>
                )}
            </section>
        </main>
    );
};

export default Account;

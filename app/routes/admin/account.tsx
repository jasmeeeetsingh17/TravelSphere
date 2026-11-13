import { Link, useNavigate } from "react-router";
import dayjs from "dayjs";
import { CalendarDays, ExternalLink, Fingerprint, LogOut, Mail, MapPinned, Plus, ShieldCheck, Sparkles, Ticket, TrendingUp } from "lucide-react";
import { TripCard } from "../../../components";
import KpiCard from "../../../components/KpiCard";
import { getUser, logoutUser } from "~/appwrite/auth";
import { loadBookings } from "~/appwrite/admin";
import { getSavedTrips } from "~/appwrite/trips";
import { withBookingStats } from "~/lib/booking";
import { rankTrips } from "~/lib/profit";
import { formatDate, money } from "~/lib/utils";
import type { Route } from "./+types/account";

export const meta = () => [{ title: "My account | TravelSphere Admin" }];

export const clientLoader = async () => {
    const user = await getUser();
    const accountId = (user?.accountId as string | undefined) ?? "";
    const [mine, { bookings }] = await Promise.all([accountId ? getSavedTrips(200, accountId) : Promise.resolve([]), loadBookings()]);
    const trips = withBookingStats(mine, bookings);
    return {
        name: (user?.name as string | undefined) ?? "Admin",
        email: (user?.email as string | undefined) ?? "",
        imageUrl: (user?.imageUrl as string | undefined) || "/assets/images/david.webp",
        joinedAt: (user?.joinedAt as string | undefined) ?? (user?.$createdAt as string | undefined) ?? "",
        accountId,
        trips,
    };
};

const Account = ({ loaderData }: Route.ComponentProps) => {
    const { name, email, imageUrl, joinedAt, accountId, trips } = loaderData;
    const navigate = useNavigate();

    const bookings = trips.reduce((s, t) => s + t.bookings, 0);
    const profit = rankTrips(trips).reduce((s, r) => s + r.profit, 0);
    const states = new Set(trips.map((t) => t.state).filter(Boolean)).size;
    const days = joinedAt ? Math.max(0, dayjs().diff(joinedAt, "day")) : 0;
    const thisMonth = trips.filter((t) => t.createdAt && dayjs(t.createdAt).isSame(dayjs(), "month")).length;

    const signOut = async () => {
        await logoutUser();
        navigate("/sign-in");
    };

    const details = [
        { Icon: Mail, label: "Email", value: email || "-" },
        { Icon: ShieldCheck, label: "Role", value: "Administrator" },
        { Icon: CalendarDays, label: "Member since", value: joinedAt ? formatDate(joinedAt) : "-" },
        { Icon: Fingerprint, label: "Account ID", value: accountId ? `${accountId.slice(0, 6)}…${accountId.slice(-4)}` : "-" },
    ];

    return (
        <main className="dashboard wrapper">
            {/* Profile header */}
            <section className="bg-white rounded-3xl border border-light-400 shadow-sm overflow-hidden">
                <div className="relative h-36 md:h-44 bg-linear-to-r from-primary-100 via-primary-500 to-violet-600">
                    <img src="/assets/images/6.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-30 mix-blend-overlay" />
                </div>
                <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row md:items-end gap-5 -mt-14">
                    <img
                        src={imageUrl}
                        alt={name}
                        referrerPolicy="no-referrer"
                        className="relative size-28 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <span className="flex-1 flex flex-col gap-1.5 md:pb-1">
                        <span className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl md:text-3xl font-bold text-dark-100">{name}</h1>
                            <span className="flex items-center gap-1 bg-success-50 text-success-700 text-xs font-semibold rounded-full px-2.5 py-1">
                                <ShieldCheck size={13} /> Admin
                            </span>
                        </span>
                        <span className="text-sm text-gray-100">
                            {email} · {days === 0 ? "joined today" : `${days} ${days === 1 ? "day" : "days"} on TravelSphere`}
                        </span>
                    </span>
                    <span className="flex flex-wrap gap-3">
                        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 h-11 px-5 rounded-xl border border-light-400 text-sm font-semibold text-dark-100 hover:border-primary-100 hover:text-primary-100 transition-colors">
                            <ExternalLink size={16} /> View website
                        </a>
                        <button onClick={signOut} className="flex items-center gap-2 h-11 px-5 rounded-xl bg-red-50 text-sm font-semibold text-red-500 hover:bg-red-100 transition-colors cursor-pointer">
                            <LogOut size={16} /> Sign out
                        </button>
                    </span>
                </div>
            </section>

            {/* Stats */}
            <ul className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard label="Trips you created" value={trips.length} note={`${thisMonth} this month`} Icon={Sparkles} tone="bg-primary-50 text-primary-100" />
                <KpiCard label="Bookings on your trips" value={bookings.toLocaleString("en-IN")} note="People who booked" Icon={Ticket} tone="bg-violet-50 text-violet-600" />
                <KpiCard label="Estimated profit earned" value={money(profit)} note="From bookings on your trips" Icon={TrendingUp} tone="bg-success-50 text-success-700" />
                <KpiCard label="States covered" value={states} note="By your trips" Icon={MapPinned} tone="bg-amber-50 text-amber-600" />
            </ul>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* Details */}
                <article className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-dark-100">Account details</h2>
                    <ul className="flex flex-col divide-y divide-light-400">
                        {details.map(({ Icon, label, value }) => (
                            <li key={label} className="flex items-center gap-3 py-3.5">
                                <span className="size-10 shrink-0 rounded-xl bg-light-200 text-gray-100 flex items-center justify-center">
                                    <Icon size={18} />
                                </span>
                                <span className="min-w-0 flex flex-col leading-tight">
                                    <small className="text-xs text-gray-100">{label}</small>
                                    <strong className="text-sm font-semibold text-dark-100 truncate">{value}</strong>
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-gray-100 leading-5 bg-light-200 rounded-xl p-3">
                        You sign in with Google. Your name and photo come from your Google account.
                    </p>
                </article>

                {/* Your trips */}
                <article className="xl:col-span-2 bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-5">
                    <header className="flex items-center justify-between gap-4">
                        <span className="flex flex-col gap-0.5">
                            <h2 className="text-lg font-semibold text-dark-100">Your trips</h2>
                            <p className="text-sm text-gray-100">The latest itineraries you created</p>
                        </span>
                        <Link to="/trips/create" className="flex items-center gap-2 bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-4 py-2 transition-colors">
                            <Plus size={16} /> New trip
                        </Link>
                    </header>
                    {trips.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {trips.slice(0, 4).map((t) => (
                                <TripCard key={t.id} id={t.id} name={t.name} imageUrl={t.imageUrl} location={t.location} tags={t.tags} price={t.price} bookings={t.bookings} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-gray-100 bg-light-200 rounded-2xl py-12">
                            You have not created any trips yet.{" "}
                            <Link to="/trips/create" className="text-primary-100 font-semibold">Create your first trip</Link>
                        </p>
                    )}
                    {trips.length > 4 && (
                        <Link to="/trips" className="self-center text-sm font-semibold text-primary-100 hover:underline">
                            See all {trips.length} trips
                        </Link>
                    )}
                </article>
            </section>
        </main>
    );
};

export default Account;

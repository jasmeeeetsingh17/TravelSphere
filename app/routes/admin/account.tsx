import { useState } from "react";
import { Link, useNavigate, useRevalidator } from "react-router";
import dayjs from "dayjs";
import {
    BadgeCheck, CalendarDays, Clock, Laptop, Loader2, LogOut, Mail, MapPin, MapPinned, Plus, ShieldCheck, Smartphone, Sparkles, Ticket, TrendingUp,
} from "lucide-react";
import { TripCard } from "../../../components";
import KpiCard from "../../../components/KpiCard";
import { loadBookings } from "~/appwrite/admin";
import { getUser, logoutUser } from "~/appwrite/auth";
import { account } from "~/appwrite/client";
import { getSavedTrips } from "~/appwrite/trips";
import { active, withBookingStats } from "~/lib/booking";
import { rankTrips } from "~/lib/profit";
import { cn, formatDate, money } from "~/lib/utils";
import type { Route } from "./+types/account";

export const meta = () => [{ title: "My account | TravelSphere Admin" }];

type SessionRow = { id: string; device: string; mobile: boolean; place: string; started: string; current: boolean };

export const clientLoader = async () => {
    const [profile, login] = await Promise.all([getUser(), account.get().catch(() => null)]);
    const accountId = (profile?.accountId as string | undefined) ?? "";
    const [mine, { bookings }, sessionList] = await Promise.all([
        accountId ? getSavedTrips(200, accountId) : Promise.resolve([]),
        loadBookings(),
        account.listSessions().catch(() => null),
    ]);
    const trips = withBookingStats(mine, bookings);

    // Bookings made on this admin's trips, newest first
    const tripIds = new Set(trips.map((t) => t.id));
    const tripNames = new Set(trips.map((t) => t.name.toLowerCase()));
    const myBookings = bookings.filter((b) => tripIds.has(b.tripId) || tripNames.has(b.tripName.toLowerCase()));

    const sessions: SessionRow[] = (sessionList?.sessions ?? []).map((s) => ({
        id: s.$id,
        device: [s.clientName, s.osName].filter(Boolean).join(" on ") || "Unknown device",
        mobile: /android|ios|iphone|ipad/i.test(`${s.osName} ${s.deviceName}`),
        place: s.countryName || "Unknown location",
        started: s.$createdAt,
        current: s.current,
    }));

    return {
        name: (profile?.name as string | undefined) ?? login?.name ?? "Admin",
        email: (profile?.email as string | undefined) ?? login?.email ?? "",
        imageUrl: (profile?.imageUrl as string | undefined) || "",
        joinedAt: (profile?.joinedAt as string | undefined) ?? login?.registration ?? "",
        lastActive: login?.accessedAt ?? "",
        verified: Boolean(login?.emailVerification),
        trips,
        myBookings,
        sessions,
    };
};

const Account = ({ loaderData }: Route.ComponentProps) => {
    const { name, email, imageUrl, joinedAt, lastActive, verified, trips, myBookings, sessions } = loaderData;
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");

    const people = myBookings.filter(active).reduce((s, b) => s + b.travellers, 0);
    const profit = rankTrips(trips).reduce((s, r) => s + r.profit, 0);
    const states = new Set(trips.map((t) => t.state).filter(Boolean)).size;
    const days = joinedAt ? Math.max(0, dayjs().diff(joinedAt, "day")) : 0;

    const signOut = async () => {
        await logoutUser();
        navigate("/sign-in");
    };

    const endSession = async (id: string) => {
        setBusy(id);
        setError("");
        try {
            await account.deleteSession({ sessionId: id });
            revalidator.revalidate();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not sign that device out.");
        } finally {
            setBusy("");
        }
    };

    const signOutEverywhere = async () => {
        setBusy("all");
        try {
            await account.deleteSessions();
        } finally {
            navigate("/sign-in");
        }
    };

    const details = [
        { Icon: Mail, label: "Email", value: email || "-", extra: verified ? "Verified" : "" },
        { Icon: ShieldCheck, label: "Role", value: "Administrator" },
        { Icon: BadgeCheck, label: "Sign-in method", value: "Google" },
        { Icon: CalendarDays, label: "Member since", value: joinedAt ? formatDate(joinedAt) : "-" },
        { Icon: Clock, label: "Last active", value: lastActive ? dayjs(lastActive).format("D MMM YYYY, h:mm A") : "-" },
    ];

    return (
        <main className="dashboard wrapper">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
                {/* ---------------- Left: profile ---------------- */}
                <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
                    <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col items-center text-center gap-3">
                        {imageUrl ? (
                            <img src={imageUrl} alt="" referrerPolicy="no-referrer" className="size-24 rounded-full object-cover ring-4 ring-primary-50" />
                        ) : (
                            <span className="size-24 rounded-full bg-linear-to-br from-primary-100 to-violet-600 text-white text-3xl font-bold flex items-center justify-center ring-4 ring-primary-50">
                                {name.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <span className="flex flex-col gap-1">
                            <h1 className="text-xl font-bold text-dark-100">{name}</h1>
                            <small className="text-sm text-gray-100 break-all">{email}</small>
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-success-50 text-success-700 px-3 py-1 text-xs font-semibold">
                            <ShieldCheck size={13} /> Admin · {days === 0 ? "joined today" : `${days} ${days === 1 ? "day" : "days"}`}
                        </span>
                        <button
                            onClick={signOut}
                            className="mt-2 w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-light-400 text-sm font-semibold text-dark-100 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                        >
                            <LogOut size={16} /> Sign out
                        </button>
                    </section>

                    <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-1">
                        <h2 className="text-base font-semibold text-dark-100 mb-2">Account details</h2>
                        <ul className="flex flex-col divide-y divide-light-400">
                            {details.map(({ Icon, label, value, extra }) => (
                                <li key={label} className="flex items-center gap-3 py-3">
                                    <Icon size={17} className="shrink-0 text-gray-100" />
                                    <span className="min-w-0 flex-1 flex flex-col leading-tight">
                                        <small className="text-xs text-gray-100">{label}</small>
                                        <strong className="text-sm font-semibold text-dark-100 truncate">{value}</strong>
                                    </span>
                                    {extra && <span className="text-[11px] font-semibold text-success-700 bg-success-50 rounded-full px-2 py-0.5">{extra}</span>}
                                </li>
                            ))}
                        </ul>
                    </section>
                </aside>

                {/* ---------------- Right: activity ---------------- */}
                <div className="flex flex-col gap-6 min-w-0">
                    <ul className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        <KpiCard label="Trips you created" value={trips.length} Icon={Sparkles} tone="bg-primary-50 text-primary-100" />
                        <KpiCard label="People booked" value={people.toLocaleString("en-IN")} note="On your trips" Icon={Ticket} tone="bg-violet-50 text-violet-600" />
                        <KpiCard label="Profit earned" value={money(profit)} note="Estimated" Icon={TrendingUp} tone="bg-success-50 text-success-700" />
                        <KpiCard label="States covered" value={states} Icon={MapPinned} tone="bg-amber-50 text-amber-600" />
                    </ul>

                    {/* Recent bookings on your trips */}
                    <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-4">
                        <header className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-dark-100">Recent bookings on your trips</h2>
                            <Link to="/bookings" className="text-sm font-semibold text-primary-100 hover:underline">All bookings</Link>
                        </header>
                        {myBookings.length ? (
                            <ul className="flex flex-col divide-y divide-light-400">
                                {myBookings.slice(0, 5).map((b) => (
                                    <li key={b.id} className="flex items-center gap-3 py-3">
                                        <span className="size-9 shrink-0 rounded-full bg-primary-50 text-primary-100 text-sm font-bold flex items-center justify-center">
                                            {b.customerName.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="flex-1 min-w-0 flex flex-col leading-tight">
                                            <strong className="text-sm text-dark-100 truncate">{b.customerName}</strong>
                                            <small className="text-xs text-gray-100 truncate">{b.tripName} · {b.travellers} {b.travellers === 1 ? "person" : "people"}</small>
                                        </span>
                                        <strong className="text-sm tabular-nums text-dark-100">{money(b.amount)}</strong>
                                        <span
                                            className={cn(
                                                "w-20 text-center text-[11px] font-semibold rounded-full px-2 py-1",
                                                b.status === "Confirmed" ? "bg-success-50 text-success-700" : b.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-light-300 text-gray-500"
                                            )}
                                        >
                                            {b.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-sm text-gray-100 bg-light-200 rounded-2xl py-8">No bookings on your trips yet.</p>
                        )}
                    </section>

                    {/* Signed-in devices */}
                    <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-4">
                        <header className="flex flex-wrap items-center justify-between gap-3">
                            <span className="flex flex-col">
                                <h2 className="text-lg font-semibold text-dark-100">Where you're signed in</h2>
                                <small className="text-sm text-gray-100">Sign out of any device you don't recognise.</small>
                            </span>
                            {sessions.length > 1 && (
                                <button
                                    onClick={signOutEverywhere}
                                    disabled={!!busy}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg px-3 py-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {busy === "all" ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />} Sign out everywhere
                                </button>
                            )}
                        </header>
                        {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">{error}</p>}
                        <ul className="flex flex-col divide-y divide-light-400">
                            {sessions.map((s) => (
                                <li key={s.id} className="flex items-center gap-3 py-3">
                                    <span className="size-10 shrink-0 rounded-xl bg-light-200 text-dark-200 flex items-center justify-center">
                                        {s.mobile ? <Smartphone size={18} /> : <Laptop size={18} />}
                                    </span>
                                    <span className="flex-1 min-w-0 flex flex-col leading-tight">
                                        <strong className="flex items-center gap-2 text-sm text-dark-100 truncate">
                                            {s.device}
                                            {s.current && <span className="rounded-full bg-success-50 text-success-700 text-[10px] font-bold px-2 py-0.5">THIS DEVICE</span>}
                                        </strong>
                                        <small className="flex items-center gap-1 text-xs text-gray-100">
                                            <MapPin size={12} /> {s.place} · since {dayjs(s.started).format("D MMM, h:mm A")}
                                        </small>
                                    </span>
                                    {!s.current && (
                                        <button
                                            onClick={() => endSession(s.id)}
                                            disabled={!!busy}
                                            className="text-xs font-semibold text-gray-100 hover:text-red-500 hover:bg-red-50 rounded-lg px-3 py-1.5 cursor-pointer disabled:opacity-50"
                                        >
                                            {busy === s.id ? <Loader2 size={14} className="animate-spin" /> : "Sign out"}
                                        </button>
                                    )}
                                </li>
                            ))}
                            {!sessions.length && <li className="py-3 text-sm text-gray-100">Session details are not available.</li>}
                        </ul>
                    </section>

                    {/* Your trips */}
                    <section className="flex flex-col gap-4">
                        <header className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-dark-100">Your trips</h2>
                            <Link to="/trips/create" className="flex items-center gap-1.5 text-sm font-semibold text-primary-100 hover:underline">
                                <Plus size={16} /> New trip
                            </Link>
                        </header>
                        {trips.length ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {trips.slice(0, 3).map((t) => (
                                    <TripCard key={t.id} id={t.id} name={t.name} imageUrl={t.imageUrl} location={t.location} tags={t.tags} price={t.price} bookings={t.bookings} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-sm text-gray-100 bg-white border border-light-400 rounded-3xl py-10">
                                You have not created any trips yet. <Link to="/trips/create" className="text-primary-100 font-semibold">Create your first trip</Link>
                            </p>
                        )}
                        {trips.length > 3 && (
                            <Link to="/trips" className="self-center text-sm font-semibold text-primary-100 hover:underline">
                                See all {trips.length} trips
                            </Link>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Account;

import { Link } from "react-router";
import dayjs from "dayjs";
import {
    Category,
    ChartComponent,
    Inject as ChartInject,
    Legend,
    SeriesCollectionDirective,
    SeriesDirective,
    SplineAreaSeries,
    Tooltip,
} from "@syncfusion/ej2-react-charts";
import { ArrowRight, BarChart3, BellRing, CalendarCheck, Clock, Plus, Sparkles, Wallet } from "lucide-react";
import { TripCard } from "../../../components";
import ChartCard from "../../../components/ChartCard";
import KpiCard from "../../../components/KpiCard";
import { loadBookings } from "~/appwrite/admin";
import { getUser } from "~/appwrite/auth";
import { getSavedTrips } from "~/appwrite/trips";
import { dummyTrips } from "~/constants/dummyTrips";
import { bookedTrips, withBookingStats } from "~/lib/booking";
import { categoryAxis, chartArea, COLORS, legend, tooltip, valueAxis } from "~/lib/chart-theme";
import { bucket, lastMonths, monthLabel, pctChange, thisVsLast } from "~/lib/stats";
import { cn, money } from "~/lib/utils";
import type { Route } from "./+types/dashboard";

export const meta = () => [{ title: "Dashboard | TravelSphere Admin" }];

export const clientLoader = async () => {
    const [user, trips, data] = await Promise.all([getUser(), getSavedTrips(500), loadBookings()]);
    return { name: (user?.name as string | undefined) ?? "Admin", trips: withBookingStats(trips, data.bookings), ...data };
};

const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const STATUS_DOT = { Pending: "bg-amber-400", Confirmed: "bg-success-500", Cancelled: "bg-gray-300" } as const;

const Dashboard = ({ loaderData }: Route.ComponentProps) => {
    const { name, trips, bookings, ready } = loaderData;

    const bookingDates = bookings.map((b) => ({ date: b.createdAt }));
    const revenueItems = bookings.filter((b) => b.status === "Confirmed").map((b) => ({ date: b.createdAt, value: b.amount }));
    const tripDates = trips.map((t) => ({ date: t.createdAt ?? "" }));
    const bTrend = thisVsLast(bookingDates);
    const rTrend = thisVsLast(revenueItems);

    const months = lastMonths(6);
    const bSeries = bucket(bookingDates, months);
    const tSeries = bucket(tripDates, months);
    const growth = months.map((m, i) => ({ month: monthLabel(m), bookings: bSeries[i], trips: tSeries[i] }));

    const revenue = revenueItems.reduce((s, r) => s + (r.value ?? 0), 0);
    const pending = bookings.filter((b) => b.status === "Pending");
    const catalog = [...trips.map((trip) => ({ trip, href: `/trips/${trip.id}` })), ...dummyTrips.map((trip) => ({ trip, href: `/travel/${trip.id}` }))];
    const mostBooked = bookedTrips(bookings, catalog).slice(0, 5);
    const topCount = mostBooked[0]?.people ?? 1;

    return (
        <main className="dashboard wrapper">
            {/* Welcome banner */}
            <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary-100 via-primary-500 to-violet-600 text-white p-6 md:p-10">
                <span className="absolute -right-10 -top-16 size-56 rounded-full bg-white/10" />
                <span className="absolute right-32 -bottom-24 size-48 rounded-full bg-white/10" />
                <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <span className="flex flex-col gap-2">
                        <small className="text-white/75 font-medium">{dayjs().format("dddd, D MMMM YYYY")}</small>
                        <h1 className="text-2xl md:text-4xl font-bold">
                            {greeting()}, {name.split(" ")[0]} 👋
                        </h1>
                        <p className="text-white/80 max-w-lg">
                            {pending.length
                                ? `You have ${pending.length} booking ${pending.length === 1 ? "request" : "requests"} waiting for confirmation.`
                                : "Here is what is happening across TravelSphere today."}
                        </p>
                    </span>
                    <span className="flex flex-wrap gap-3">
                        {pending.length > 0 && (
                            <Link to="/bookings" className="flex items-center gap-2 bg-amber-400 text-dark-100 font-semibold rounded-full px-5 py-2.5 hover:scale-105 transition-transform">
                                <BellRing size={18} /> Review requests
                            </Link>
                        )}
                        <Link to="/trips/create" className="flex items-center gap-2 bg-white text-primary-100 font-semibold rounded-full px-5 py-2.5 hover:scale-105 transition-transform">
                            <Plus size={18} /> Create trip
                        </Link>
                        <Link to="/analytics" className="flex items-center gap-2 border border-white/50 text-white font-semibold rounded-full px-5 py-2.5 hover:bg-white/10 transition-colors">
                            <BarChart3 size={18} /> Analytics
                        </Link>
                    </span>
                </div>
            </section>

            {!ready && (
                <p className="rounded-2xl bg-amber-50 text-amber-700 px-5 py-3 text-sm">
                    Bookings are not set up yet. <Link to="/bookings" className="font-semibold underline">Set them up</Link> so visitors can book trips from the website.
                </p>
            )}

            {/* KPIs */}
            <ul className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard label="Bookings" value={bookings.length} note={`${bTrend.current} this month`} delta={pctChange(bTrend.current, bTrend.last)} Icon={CalendarCheck} tone="bg-primary-50 text-primary-100" />
                <KpiCard label="Confirmed revenue" value={money(revenue)} note={`${money(rTrend.current)} this month`} delta={pctChange(rTrend.current, rTrend.last)} Icon={Wallet} tone="bg-success-50 text-success-700" />
                <KpiCard label="Waiting to confirm" value={pending.length} note={money(pending.reduce((s, b) => s + b.amount, 0))} Icon={Clock} tone="bg-amber-50 text-amber-600" />
                <KpiCard label="Trips" value={trips.length} note="In the database" Icon={Sparkles} tone="bg-violet-50 text-violet-600" />
            </ul>

            {/* Growth + most booked */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <ChartCard
                    className="xl:col-span-2"
                    title="Bookings and new trips"
                    subtitle="Last 6 months"
                    empty={!bookings.length && !trips.length ? "Nothing to show yet." : undefined}
                >
                    <ChartComponent id="dash-growth" dataSource={growth} primaryXAxis={categoryAxis} primaryYAxis={valueAxis({ minimum: 0 })} chartArea={chartArea} tooltip={tooltip} legendSettings={legend} background="transparent" height="300px">
                        <ChartInject services={[SplineAreaSeries, Category, Tooltip, Legend]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={growth} xName="month" yName="bookings" name="Bookings" type="SplineArea" fill={COLORS.green} opacity={0.18} border={{ width: 3, color: COLORS.green }} marker={{ visible: true, width: 8, height: 8, fill: "#ffffff", border: { width: 2, color: COLORS.green } }} />
                            <SeriesDirective dataSource={growth} xName="month" yName="trips" name="New trips" type="SplineArea" fill={COLORS.blue} opacity={0.15} border={{ width: 3, color: COLORS.blue }} marker={{ visible: true, width: 8, height: 8, fill: "#ffffff", border: { width: 2, color: COLORS.blue } }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>

                <article className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-4">
                    <header className="flex items-center justify-between">
                        <span className="flex flex-col gap-0.5">
                            <h2 className="text-lg font-semibold text-dark-100">Most booked trips</h2>
                            <p className="text-sm text-gray-100">By people booked</p>
                        </span>
                        <Link to="/analytics" className="text-sm font-semibold text-primary-100 hover:underline">Details</Link>
                    </header>
                    {mostBooked.length ? (
                        <ol className="flex flex-col gap-3.5">
                            {mostBooked.map((t, i) => (
                                <li key={t.key}>
                                    <Link to={t.href} className="group flex items-center gap-3">
                                        <span className="w-4 text-sm font-bold text-gray-100 tabular-nums">{i + 1}</span>
                                        <img src={t.imageUrl} alt="" className="size-11 rounded-xl object-cover" />
                                        <span className="flex-1 min-w-0 flex flex-col gap-1.5">
                                            <span className="flex items-center justify-between gap-2">
                                                <strong className="text-sm font-semibold text-dark-100 truncate group-hover:text-primary-100">{t.name}</strong>
                                                <small className="shrink-0 text-xs font-semibold text-dark-100 tabular-nums">{t.people} people</small>
                                            </span>
                                            <span className="h-1.5 rounded-full bg-light-300 overflow-hidden">
                                                <span className="block h-full rounded-full bg-linear-to-r from-primary-100 to-violet-600" style={{ width: `${(t.people / topCount) * 100}%` }} />
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="flex-1 flex items-center justify-center text-center text-sm text-gray-100 bg-light-200 rounded-2xl px-4 py-10">No bookings yet.</p>
                    )}
                </article>
            </section>

            {/* Recent bookings */}
            <section className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-4">
                <header className="flex items-center justify-between">
                    <span className="flex flex-col gap-0.5">
                        <h2 className="text-lg font-semibold text-dark-100">Recent bookings</h2>
                        <p className="text-sm text-gray-100">The latest requests from the website and your team</p>
                    </span>
                    <Link to="/bookings" className="flex items-center gap-1.5 text-sm font-semibold text-primary-100 hover:gap-2.5 transition-all">
                        Manage <ArrowRight size={16} />
                    </Link>
                </header>
                {bookings.length ? (
                    <ul className="flex flex-col divide-y divide-light-400">
                        {bookings.slice(0, 5).map((b) => (
                            <li key={b.id} className="flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-1 py-3">
                                <span className="size-10 shrink-0 rounded-full bg-primary-50 text-primary-100 flex items-center justify-center font-bold">
                                    {b.customerName.charAt(0).toUpperCase()}
                                </span>
                                <span className="flex-1 min-w-0 flex flex-col leading-tight">
                                    <strong className="text-sm font-semibold text-dark-100 truncate">{b.customerName}</strong>
                                    <small className="text-xs text-gray-100 truncate">
                                        {b.tripName} · {b.travellers} {b.travellers === 1 ? "person" : "people"} · {dayjs(b.travelDate).format("D MMM")}
                                    </small>
                                </span>
                                <strong className="text-sm tabular-nums text-dark-100">{money(b.amount)}</strong>
                                <span className="flex items-center gap-1.5 w-24 text-xs font-medium text-dark-200">
                                    <span className={cn("size-2 rounded-full", STATUS_DOT[b.status])} /> {b.status}
                                </span>
                                <small className="hidden md:block w-20 text-right text-xs text-gray-100">{dayjs(b.createdAt).format("D MMM")}</small>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-sm text-gray-100 bg-light-200 rounded-2xl py-10">No bookings yet.</p>
                )}
            </section>

            {/* Latest trips */}
            <section className="flex flex-col gap-5">
                <span className="flex items-center justify-between gap-4">
                    <span className="flex flex-col gap-0.5">
                        <h2 className="text-xl font-semibold text-dark-100">Latest trips</h2>
                        <p className="text-sm text-gray-100">The newest itineraries created by admins</p>
                    </span>
                    <Link to="/trips" className="flex items-center gap-1.5 text-sm font-semibold text-primary-100 hover:gap-2.5 transition-all">
                        View all <ArrowRight size={16} />
                    </Link>
                </span>

                {trips.length ? (
                    <div className="trip-grid">
                        {trips.slice(0, 4).map((t) => (
                            <TripCard key={t.id} id={t.id} name={t.name} imageUrl={t.imageUrl} location={t.location} tags={t.tags} price={t.price} bookings={t.bookings} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 bg-white rounded-3xl border border-dashed border-light-400 text-center py-14">
                        <p className="text-gray-100">No trips yet.</p>
                        <Link to="/trips/create" className="flex items-center gap-2 bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-5 py-2.5 transition-colors">
                            <Plus size={16} /> Create the first trip
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
};

export default Dashboard;

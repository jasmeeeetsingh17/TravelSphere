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
import { ArrowRight, BarChart3, MapPinned, Plus, ShieldCheck, Sparkles, Users } from "lucide-react";
import { TripCard } from "../../../components";
import ChartCard from "../../../components/ChartCard";
import KpiCard from "../../../components/KpiCard";
import { getUser } from "~/appwrite/auth";
import { getSavedTrips } from "~/appwrite/trips";
import { getAllUsers } from "~/appwrite/users";
import { categoryAxis, chartArea, COLORS, legend, tooltip, valueAxis } from "~/lib/chart-theme";
import { bucket, lastMonths, monthLabel, pctChange, thisVsLast } from "~/lib/stats";
import type { Route } from "./+types/dashboard";

export const meta = () => [{ title: "Dashboard | TravelSphere Admin" }];

export const clientLoader = async () => {
    const [user, users, trips] = await Promise.all([getUser(), getAllUsers(500), getSavedTrips(500)]);
    return { name: (user?.name as string | undefined) ?? "Admin", users, trips };
};

const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const Dashboard = ({ loaderData }: Route.ComponentProps) => {
    const { name, users, trips } = loaderData;

    const userDates = users.map((u) => ({ date: u.joinedAt }));
    const tripDates = trips.map((t) => ({ date: t.createdAt ?? "" }));
    const tripTrend = thisVsLast(tripDates);
    const userTrend = thisVsLast(userDates);

    const months = lastMonths(6);
    const tripSeries = bucket(tripDates, months);
    const userSeries = bucket(userDates, months);
    const growth = months.map((m, i) => ({ month: monthLabel(m), trips: tripSeries[i], users: userSeries[i] }));

    const states = new Set(trips.map((t) => t.state).filter(Boolean)).size;
    const admins = users.filter((u) => u.status === "admin").length;

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
                        <p className="text-white/80 max-w-lg">Here is what is happening across TravelSphere today.</p>
                    </span>
                    <span className="flex flex-wrap gap-3">
                        <Link to="/trips/create" className="flex items-center gap-2 bg-white text-primary-100 font-semibold rounded-full px-5 py-2.5 hover:scale-105 transition-transform">
                            <Plus size={18} /> Create trip
                        </Link>
                        <Link to="/analytics" className="flex items-center gap-2 border border-white/50 text-white font-semibold rounded-full px-5 py-2.5 hover:bg-white/10 transition-colors">
                            <BarChart3 size={18} /> Analytics
                        </Link>
                    </span>
                </div>
            </section>

            {/* KPIs */}
            <ul className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard label="Total trips" value={trips.length} note={`${tripTrend.current} this month`} delta={pctChange(tripTrend.current, tripTrend.last)} Icon={Sparkles} tone="bg-primary-50 text-primary-100" />
                <KpiCard label="Users" value={users.length} note={`${userTrend.current} joined this month`} delta={pctChange(userTrend.current, userTrend.last)} Icon={Users} tone="bg-pink-50 text-pink-500" />
                <KpiCard label="Admins" value={admins} note="People with panel access" Icon={ShieldCheck} tone="bg-success-50 text-success-700" />
                <KpiCard label="States covered" value={states} note="Across all trips" Icon={MapPinned} tone="bg-amber-50 text-amber-600" />
            </ul>

            {/* Growth + recent users */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <ChartCard
                    className="xl:col-span-2"
                    title="Growth overview"
                    subtitle="New trips and users over the last 6 months"
                    empty={!trips.length && !users.length ? "Nothing to show yet." : undefined}
                >
                    <ChartComponent id="dash-growth" dataSource={growth} primaryXAxis={categoryAxis} primaryYAxis={valueAxis({ minimum: 0, interval: 1 })} chartArea={chartArea} tooltip={tooltip} legendSettings={legend} background="transparent" height="300px">
                        <ChartInject services={[SplineAreaSeries, Category, Tooltip, Legend]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={growth} xName="month" yName="trips" name="Trips" type="SplineArea" fill={COLORS.blue} opacity={0.18} border={{ width: 3, color: COLORS.blue }} marker={{ visible: true, width: 8, height: 8, fill: "#ffffff", border: { width: 2, color: COLORS.blue } }} />
                            <SeriesDirective dataSource={growth} xName="month" yName="users" name="Users" type="SplineArea" fill={COLORS.pink} opacity={0.15} border={{ width: 3, color: COLORS.pink }} marker={{ visible: true, width: 8, height: 8, fill: "#ffffff", border: { width: 2, color: COLORS.pink } }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>

                <article className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-4">
                    <header className="flex items-center justify-between">
                        <span className="flex flex-col gap-0.5">
                            <h2 className="text-lg font-semibold text-dark-100">Recent users</h2>
                            <p className="text-sm text-gray-100">Latest people to sign in</p>
                        </span>
                        <Link to="/all-users" className="text-sm font-semibold text-primary-100 hover:underline">See all</Link>
                    </header>
                    {users.length ? (
                        <ul className="flex flex-col divide-y divide-light-400">
                            {users.slice(0, 6).map((u) => (
                                <li key={u.id} className="flex items-center gap-3 py-3">
                                    <img src={u.imageUrl} alt="" referrerPolicy="no-referrer" className="size-10 rounded-full object-cover" />
                                    <span className="flex-1 min-w-0 flex flex-col leading-tight">
                                        <strong className="text-sm font-semibold text-dark-100 truncate">{u.name}</strong>
                                        <small className="text-xs text-gray-100 truncate">{u.email}</small>
                                    </span>
                                    <span className={u.status === "admin" ? "text-[11px] font-semibold rounded-full px-2.5 py-1 bg-success-50 text-success-700" : "text-[11px] font-semibold rounded-full px-2.5 py-1 bg-light-300 text-gray-500"}>
                                        {u.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="flex-1 flex items-center justify-center text-sm text-gray-100 bg-light-200 rounded-2xl py-10">No users yet.</p>
                    )}
                </article>
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
                            <TripCard key={t.id} id={t.id} name={t.name} imageUrl={t.imageUrl} location={t.location} tags={t.tags} price={t.price} />
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

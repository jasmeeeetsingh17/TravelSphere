import { useMemo, useState } from "react";
import {
    AccumulationChartComponent,
    AccumulationDataLabel,
    AccumulationLegend,
    AccumulationSeriesCollectionDirective,
    AccumulationSeriesDirective,
    AccumulationTooltip,
    BarSeries,
    Category,
    ChartComponent,
    ColumnSeries,
    DataLabel,
    Inject as ChartInject,
    Legend,
    PieSeries,
    SeriesCollectionDirective,
    SeriesDirective,
    SplineAreaSeries,
    StackingBarSeries,
    Tooltip,
} from "@syncfusion/ej2-react-charts";
import { Link } from "react-router";
import { Award, CalendarRange, Ticket, Clock, Lightbulb, MapPinned, Percent, PiggyBank, Plus, Sparkles, TrendingUp, Users } from "lucide-react";
import { Header } from "../../../components";
import ChartCard from "../../../components/ChartCard";
import KpiCard from "../../../components/KpiCard";
import { getSavedTrips } from "~/appwrite/trips";
import { getAllUsers } from "~/appwrite/users";
import { categoryAxis, chartArea, COLORS, legend, PALETTE, tooltip, valueAxis } from "~/lib/chart-theme";
import { bucket, countBy, lastMonths, monthLabel, pctChange, thisVsLast } from "~/lib/stats";
import { MARGINS, profitBy, rankTrips, recommend } from "~/lib/profit";
import { cn, money, moneyShort } from "~/lib/utils";
import type { Route } from "./+types/analytics";

export const meta = () => [{ title: "Analytics | TravelSphere Admin" }];

const RANGES = [
    { label: "3M", value: 3 },
    { label: "6M", value: 6 },
    { label: "12M", value: 12 },
];

const BUDGET_ORDER = ["Budget", "Mid-range", "Luxury", "Premium"];

export const clientLoader = async () => {
    const [trips, users] = await Promise.all([getSavedTrips(500), getAllUsers(500)]);
    return { trips, users };
};

const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);

const Analytics = ({ loaderData }: Route.ComponentProps) => {
    const { trips, users } = loaderData;
    const [range, setRange] = useState(6);

    const d = useMemo(() => {
        const months = lastMonths(range);
        const labels = months.map((m) => monthLabel(m, range > 6));
        const start = months[0];

        const tripDates = trips.map((t) => ({ date: t.createdAt ?? "" }));
        const userDates = users.map((u) => ({ date: u.joinedAt }));

        const tripsSeries = bucket(tripDates, months);
        const usersSeries = bucket(userDates, months);

        const inRange = trips.filter((t) => t.createdAt && !start.isAfter(t.createdAt, "month"));

        const interests = countBy(trips.flatMap((t) => (t.interests ?? []).map((i) => ({ i }))), (o) => o.i).slice(0, 6);

        const budgets = BUDGET_ORDER.map((b, i) => ({ x: b, y: trips.filter((t) => t.budget === b).length, color: PALETTE[i] })).filter((b) => b.y);

        const tTrend = thisVsLast(tripDates);
        const uTrend = thisVsLast(userDates);
        const topState = countBy(trips, (t) => t.state ?? "")[0];

        return {
            overview: labels.map((month, i) => ({ month, trips: tripsSeries[i], users: usersSeries[i] })),
            byGroup: countBy(trips, (t) => t.group).map((g, i) => ({ ...g, color: PALETTE[i % PALETTE.length] })),
            byState: countBy(trips, (t) => t.state ?? "").slice(0, 8),
            interests,
            budgets,
            inRange: inRange.length,
            avgDays: avg(trips.map((t) => t.dayCount).filter(Boolean)),
            topState: topState?.x ?? "-",
            topStateCount: topState?.y ?? 0,
            tripsDelta: pctChange(tTrend.current, tTrend.last),
            usersDelta: pctChange(uTrend.current, uTrend.last),
        };
    }, [range, trips, users]);

    const noTrips = !trips.length ? "No trips yet. Create one to see this chart." : undefined;

    const p = useMemo(() => {
        const ranked = rankTrips(trips);
        const sum = (f: (r: (typeof ranked)[number]) => number) => ranked.reduce((s, r) => s + f(r), 0);
        const short = (name: string) => (name.length > 26 ? name.slice(0, 24) + "…" : name);
        const priceTotal = sum((r) => r.price);
        const withBookings = ranked.filter((r) => r.bookings > 0);
        return {
            ranked,
            totalProfit: sum((r) => r.profit),
            totalRevenue: sum((r) => r.revenue),
            totalBookings: sum((r) => r.bookings),
            bookedTrips: withBookings.length,
            avgMargin: priceTotal ? Math.round((sum((r) => r.unitProfit) / priceTotal) * 100) : 0,
            top: [...withBookings]
                .sort((a, b) => b.profit - a.profit)
                .slice(0, 8)
                .map((r) => ({ x: short(r.name), cost: r.cost, profit: r.profit })),
            mostBooked: [...withBookings]
                .sort((a, b) => b.bookings - a.bookings)
                .slice(0, 8)
                .map((r) => ({ x: short(r.name), y: r.bookings })),
            byStyle: profitBy(ranked, (r) => r.style),
            byState: profitBy(ranked, (r) => r.state).slice(0, 8),
            ideas: recommend(ranked),
        };
    }, [trips]);

    const verdictStyle = {
        "Make more": "bg-success-50 text-success-700",
        Good: "bg-primary-50 text-primary-100",
        Review: "bg-amber-50 text-amber-600",
    } as const;

    return (
        <main className="dashboard wrapper">
            <span className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <Header title="Analytics" description="Profit, growth and what travellers are planning, from your live trip data." />
                <div className="flex items-center gap-1 bg-white border border-light-400 rounded-full p-1 shadow-sm w-fit shrink-0" role="tablist" aria-label="Time range">
                    <CalendarRange size={16} className="text-gray-100 mx-2" />
                    {RANGES.map((r) => (
                        <button
                            key={r.value}
                            role="tab"
                            aria-selected={range === r.value}
                            onClick={() => setRange(r.value)}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer",
                                range === r.value ? "bg-primary-100 text-white shadow" : "text-gray-100 hover:text-dark-100"
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </span>

            <ul className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard label="Trips in range" value={d.inRange} note={`${trips.length} all time`} delta={d.tripsDelta} Icon={Sparkles} tone="bg-primary-50 text-primary-100" />
                <KpiCard label="Users" value={users.length} note="Signed-in accounts" delta={d.usersDelta} Icon={Users} tone="bg-pink-50 text-pink-500" />
                <KpiCard label="Average trip length" value={`${d.avgDays.toFixed(1)} days`} note="Across all trips" Icon={Clock} tone="bg-sky-50 text-sky-600" />
                <KpiCard label="Most popular state" value={d.topState} note={d.topStateCount ? `${d.topStateCount} trips` : "No trips yet"} Icon={MapPinned} tone="bg-amber-50 text-amber-600" />
            </ul>


            {/* ---------------- Profitability ---------------- */}
            <section className="flex flex-col gap-6">
                <span className="flex flex-col gap-1">
                    <h2 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-dark-100">
                        <PiggyBank size={24} className="text-success-700" /> Profitability
                    </h2>
                    <p className="text-sm text-gray-100">
                        Which trips earn the most, and which kinds of trip to create more of. Profit is estimated from each trip's price using a margin per budget level:{" "}
                        {Object.entries(MARGINS).map(([k, v], i) => (
                            <span key={k} className="font-medium text-dark-100">
                                {k} {Math.round(v * 100)}%{i < Object.keys(MARGINS).length - 1 ? ", " : "."}
                            </span>
                        ))}
                    </p>
                </span>

                <ul className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                    <KpiCard label="Total bookings" value={p.totalBookings.toLocaleString("en-IN")} note={`On ${p.bookedTrips} of ${p.ranked.length} trips`} Icon={Ticket} tone="bg-primary-50 text-primary-100" />
                    <KpiCard label="Revenue from bookings" value={money(p.totalRevenue)} note="Price × bookings" Icon={Award} tone="bg-violet-50 text-violet-600" />
                    <KpiCard label="Estimated profit earned" value={money(p.totalProfit)} note="After the margin per budget level" Icon={TrendingUp} tone="bg-success-50 text-success-700" />
                    <KpiCard label="Average margin" value={`${p.avgMargin}%`} note="Profit as a share of price" Icon={Percent} tone="bg-sky-50 text-sky-600" />
                </ul>

                {!p.totalBookings && p.ranked.length > 0 && (
                    <p className="rounded-2xl bg-amber-50 text-amber-700 px-5 py-3 text-sm">
                        No bookings entered yet, so earnings show ₹0. Open a trip, click <strong>Edit trip</strong> and set how many people booked it.
                    </p>
                )}

                {/* Make more like this */}
                <article className="relative overflow-hidden rounded-3xl bg-linear-to-br from-dark-100 to-[#1f2a44] text-white p-6 md:p-8 flex flex-col gap-5">
                    <span className="absolute -right-12 -top-12 size-48 rounded-full bg-primary-100/20" />
                    <header className="relative flex items-center gap-3">
                        <span className="size-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                            <Lightbulb size={22} />
                        </span>
                        <span className="flex flex-col">
                            <h3 className="text-lg font-semibold">Make more trips like these</h3>
                            <small className="text-white/60">Trip types that earn the most per day and get the most bookings</small>
                        </span>
                    </header>
                    {p.ideas.length ? (
                        <ol className="relative grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {p.ideas.map((idea, i) => (
                                <li key={idea.label} className="bg-white/[0.07] border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
                                    <span className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">#{i + 1} pick</span>
                                        <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-success-500/20 text-emerald-300">
                                            {moneyShort(idea.avgProfitPerDay)}/day
                                        </span>
                                    </span>
                                    <strong className="text-base leading-snug">{idea.label}</strong>
                                    <small className="text-white/60">
                                        {money(idea.avgProfit)} profit per booking · {idea.bookings} {idea.bookings === 1 ? "booking" : "bookings"} on {idea.trips} {idea.trips === 1 ? "trip" : "trips"}
                                    </small>
                                    <Link
                                        to={`/trips/create?state=${encodeURIComponent(idea.state)}&style=${encodeURIComponent(idea.style)}&budget=${encodeURIComponent(idea.budget)}`}
                                        className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-white text-dark-100 text-sm font-semibold py-2.5 hover:bg-primary-50 transition-colors"
                                    >
                                        <Plus size={16} /> Create a similar trip
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="relative text-white/70 text-sm">Create a few trips with prices to get suggestions here.</p>
                    )}
                </article>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <ChartCard title="Most booked trips" subtitle="Number of people who booked" empty={!p.mostBooked.length ? noTrips ?? "No bookings entered yet." : undefined}>
                        <ChartComponent id="an-most-booked" dataSource={p.mostBooked} primaryXAxis={{ ...categoryAxis, isInversed: true }} primaryYAxis={valueAxis({ minimum: 0 })} chartArea={chartArea} tooltip={{ enable: true, format: "${point.x}: <b>${point.y} bookings</b>" }} background="transparent" height={`${Math.max(260, p.mostBooked.length * 46)}px`}>
                            <ChartInject services={[BarSeries, Category, Tooltip, DataLabel]} />
                            <SeriesCollectionDirective>
                                <SeriesDirective dataSource={p.mostBooked} xName="x" yName="y" name="Bookings" type="Bar" fill={COLORS.blue} columnWidth={0.55} cornerRadius={{ topRight: 8, bottomRight: 8 }} marker={{ dataLabel: { visible: true, position: "Outer", font: { fontWeight: "600", color: "#374151" } } }} />
                            </SeriesCollectionDirective>
                        </ChartComponent>
                    </ChartCard>

                    <ChartCard title="Top trips by profit earned" subtitle="Revenue from bookings, split into cost and profit" empty={!p.top.length ? noTrips ?? "No bookings entered yet." : undefined}>
                        <ChartComponent id="an-profit-top" dataSource={p.top} primaryXAxis={{ ...categoryAxis, isInversed: true }} primaryYAxis={valueAxis({ minimum: 0, labelFormat: "₹{value}" })} chartArea={chartArea} tooltip={{ enable: true, shared: true, format: "${series.name}: <b>₹${point.y}</b>" }} legendSettings={legend} background="transparent" height={`${Math.max(260, p.top.length * 46)}px`}>
                            <ChartInject services={[StackingBarSeries, Category, Tooltip, Legend]} />
                            <SeriesCollectionDirective>
                                <SeriesDirective dataSource={p.top} xName="x" yName="cost" name="Cost" type="StackingBar" fill="#e2e8f0" columnWidth={0.55} />
                                <SeriesDirective dataSource={p.top} xName="x" yName="profit" name="Profit" type="StackingBar" fill={COLORS.green} columnWidth={0.55} cornerRadius={{ topRight: 8, bottomRight: 8 }} />
                            </SeriesCollectionDirective>
                        </ChartComponent>
                    </ChartCard>

                    <ChartCard title="Profit per booking by travel style" subtitle="Which styles earn the most each time someone books" empty={!p.byStyle.length ? noTrips ?? "No priced trips yet." : undefined}>
                        <ChartComponent id="an-profit-style" dataSource={p.byStyle} primaryXAxis={categoryAxis} primaryYAxis={valueAxis({ minimum: 0, labelFormat: "₹{value}" })} chartArea={chartArea} tooltip={{ enable: true, format: "${point.x}: <b>₹${point.y}</b>" }} background="transparent" height="300px">
                            <ChartInject services={[ColumnSeries, Category, Tooltip]} />
                            <SeriesCollectionDirective>
                                <SeriesDirective dataSource={p.byStyle} xName="x" yName="y" name="Avg profit" type="Column" fill={COLORS.green} columnWidth={0.5} cornerRadius={{ topLeft: 10, topRight: 10 }} />
                            </SeriesCollectionDirective>
                        </ChartComponent>
                    </ChartCard>

                    <ChartCard title="Profit per booking by state" subtitle="Most profitable destinations" empty={!p.byState.length ? noTrips ?? "No priced trips yet." : undefined}>
                        <ChartComponent id="an-profit-state" dataSource={p.byState} primaryXAxis={{ ...categoryAxis, isInversed: true }} primaryYAxis={valueAxis({ minimum: 0, labelFormat: "₹{value}" })} chartArea={chartArea} tooltip={{ enable: true, format: "${point.x}: <b>₹${point.y}</b>" }} background="transparent" height="300px">
                            <ChartInject services={[BarSeries, Category, Tooltip]} />
                            <SeriesCollectionDirective>
                                <SeriesDirective dataSource={p.byState} xName="x" yName="y" name="Avg profit" type="Bar" fill={COLORS.violet} columnWidth={0.5} cornerRadius={{ topRight: 8, bottomRight: 8 }} />
                            </SeriesCollectionDirective>
                        </ChartComponent>
                    </ChartCard>
                </div>

                {/* Ranking table */}
                <article className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-4">
                    <header className="flex flex-col gap-0.5">
                        <h3 className="text-lg font-semibold text-dark-100">Trip profit ranking</h3>
                        <p className="text-sm text-gray-100">Score mixes number of bookings (40%), profit earned (35%) and profit per booking per day (25%). The best trip scores 100.</p>
                    </header>
                    {p.ranked.length ? (
                        <div className="overflow-x-auto -mx-6 px-6">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wider text-gray-100 border-b border-light-400">
                                        <th className="py-3 pr-3 font-semibold">#</th>
                                        <th className="py-3 pr-3 font-semibold">Trip</th>
                                        <th className="py-3 pr-3 font-semibold">Budget</th>
                                        <th className="py-3 pr-3 font-semibold text-right">Price</th>
                                        <th className="py-3 pr-3 font-semibold text-right">Bookings</th>
                                        <th className="py-3 pr-3 font-semibold text-right">Profit earned</th>
                                        <th className="py-3 pr-3 font-semibold text-right">Per booking / day</th>
                                        <th className="py-3 pr-3 font-semibold w-36">Score</th>
                                        <th className="py-3 font-semibold">Verdict</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-light-400">
                                    {p.ranked.slice(0, 15).map((r, i) => (
                                        <tr key={r.id} className="hover:bg-light-200 transition-colors">
                                            <td className="py-3 pr-3 text-gray-100 font-medium">{i + 1}</td>
                                            <td className="py-3 pr-3">
                                                <Link to={`/trips/${r.id}`} className="font-semibold text-dark-100 hover:text-primary-100">{r.name}</Link>
                                                <small className="block text-gray-100">{r.state} · {r.style} · {r.days} days</small>
                                            </td>
                                            <td className="py-3 pr-3 text-dark-100">{r.budget} <small className="text-gray-100">({Math.round(r.margin * 100)}%)</small></td>
                                            <td className="py-3 pr-3 text-right tabular-nums text-dark-100">{money(r.price)}</td>
                                            <td className="py-3 pr-3 text-right tabular-nums text-dark-100">{r.bookings}</td>
                                            <td className="py-3 pr-3 text-right tabular-nums font-semibold text-success-700">{money(r.profit)}</td>
                                            <td className="py-3 pr-3 text-right tabular-nums text-dark-100">{money(r.profitPerDay)}</td>
                                            <td className="py-3 pr-3">
                                                <span className="flex items-center gap-2">
                                                    <span className="flex-1 h-2 rounded-full bg-light-300 overflow-hidden">
                                                        <span className="block h-full rounded-full bg-linear-to-r from-primary-100 to-success-500" style={{ width: `${r.score}%` }} />
                                                    </span>
                                                    <small className="w-7 text-right font-semibold text-dark-100 tabular-nums">{r.score}</small>
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span className={cn("text-xs font-semibold rounded-full px-2.5 py-1 whitespace-nowrap", verdictStyle[r.verdict])}>{r.verdict}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-sm text-gray-100 bg-light-200 rounded-2xl py-10">{noTrips ?? "No priced trips yet."}</p>
                    )}
                </article>
            </section>

            <h2 className="text-xl md:text-2xl font-bold text-dark-100 -mb-2">Trends</h2>
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartCard className="xl:col-span-2" title="Activity overview" subtitle="New trips and users each month" empty={!trips.length && !users.length ? "No activity yet." : undefined}>
                    <ChartComponent id="an-overview" dataSource={d.overview} primaryXAxis={categoryAxis} primaryYAxis={valueAxis({ minimum: 0, interval: 1 })} chartArea={chartArea} tooltip={tooltip} legendSettings={legend} background="transparent" height="320px">
                        <ChartInject services={[SplineAreaSeries, Category, Tooltip, Legend]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={d.overview} xName="month" yName="trips" name="Trips" type="SplineArea" fill={COLORS.blue} opacity={0.18} border={{ width: 3, color: COLORS.blue }} marker={{ visible: true, width: 8, height: 8, fill: "#ffffff", border: { width: 2, color: COLORS.blue } }} />
                            <SeriesDirective dataSource={d.overview} xName="month" yName="users" name="Users" type="SplineArea" fill={COLORS.pink} opacity={0.15} border={{ width: 3, color: COLORS.pink }} marker={{ visible: true, width: 8, height: 8, fill: "#ffffff", border: { width: 2, color: COLORS.pink } }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>

                <ChartCard title="Budget mix" subtitle="How trips split across budget levels" empty={!d.budgets.length ? noTrips ?? "No budget data yet." : undefined}>
                    <AccumulationChartComponent id="an-budget" legendSettings={{ visible: true, position: "Bottom" }} tooltip={{ enable: true, format: "${point.x}: <b>${point.y}</b>" }} background="transparent" height="300px">
                        <ChartInject services={[PieSeries, AccumulationLegend, AccumulationTooltip, AccumulationDataLabel]} />
                        <AccumulationSeriesCollectionDirective>
                            <AccumulationSeriesDirective dataSource={d.budgets} xName="x" yName="y" type="Pie" pointColorMapping="color" radius="85%" innerRadius="60%" border={{ width: 3, color: "#ffffff" }} dataLabel={{ visible: true, name: "y", position: "Outside", font: { fontWeight: "600" } }} />
                        </AccumulationSeriesCollectionDirective>
                    </AccumulationChartComponent>
                </ChartCard>

                <ChartCard title="Trips by group type" subtitle="Who the trips are planned for" empty={noTrips}>
                    <ChartComponent id="an-groups" dataSource={d.byGroup} primaryXAxis={categoryAxis} primaryYAxis={valueAxis({ minimum: 0, interval: 1 })} chartArea={chartArea} tooltip={{ enable: true }} background="transparent" height="300px">
                        <ChartInject services={[ColumnSeries, Category, Tooltip, DataLabel]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={d.byGroup} xName="x" yName="y" name="Trips" type="Column" pointColorMapping="color" columnWidth={0.5} cornerRadius={{ topLeft: 10, topRight: 10 }} marker={{ dataLabel: { visible: true, position: "Top", font: { fontWeight: "600", color: "#374151" } } }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>

                <ChartCard title="Top interests" subtitle="What travellers want to do" empty={!d.interests.length ? noTrips ?? "No interest data yet." : undefined}>
                    <ChartComponent id="an-interests" dataSource={d.interests} primaryXAxis={{ ...categoryAxis, isInversed: true }} primaryYAxis={valueAxis({ minimum: 0, interval: 1 })} chartArea={chartArea} tooltip={{ enable: true }} background="transparent" height="300px">
                        <ChartInject services={[BarSeries, Category, Tooltip, DataLabel]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={d.interests} xName="x" yName="y" name="Trips" type="Bar" fill={COLORS.violet} columnWidth={0.5} cornerRadius={{ topRight: 8, bottomRight: 8 }} marker={{ dataLabel: { visible: true, position: "Outer", font: { fontWeight: "600", color: "#374151" } } }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>

                <ChartCard title="Popular states" subtitle="Where trips are being planned" empty={noTrips}>
                    <ChartComponent id="an-states" dataSource={d.byState} primaryXAxis={categoryAxis} primaryYAxis={valueAxis({ minimum: 0, interval: 1 })} chartArea={chartArea} tooltip={{ enable: true }} background="transparent" height="300px">
                        <ChartInject services={[ColumnSeries, Category, Tooltip, DataLabel]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={d.byState} xName="x" yName="y" name="Trips" type="Column" fill={COLORS.pink} columnWidth={0.45} cornerRadius={{ topLeft: 10, topRight: 10 }} marker={{ dataLabel: { visible: true, position: "Top", font: { fontWeight: "600", color: "#374151" } } }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>
            </section>
        </main>
    );
};

export default Analytics;

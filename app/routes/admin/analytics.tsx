import { useMemo, useState } from "react";
import {
    AccumulationChartComponent,
    AccumulationDataLabel,
    AccumulationLegend,
    AccumulationSeriesCollectionDirective,
    AccumulationSeriesDirective,
    AccumulationTooltip,
    Category,
    ChartComponent,
    ColumnSeries,
    Inject as ChartInject,
    Legend,
    PieSeries,
    SeriesCollectionDirective,
    SeriesDirective,
    AxesDirective,
    AxisDirective,
    SplineSeries,
    StackingBarSeries,
    Tooltip,
} from "@syncfusion/ej2-react-charts";
import { Link } from "react-router";
import {
    Award, CalendarCheck, CalendarRange, Filter, Lightbulb, Percent, PiggyBank, Plus, Repeat, TrendingUp, UserRound, Users, Wallet,
} from "lucide-react";
import { Header } from "../../../components";
import ChartCard from "../../../components/ChartCard";
import KpiCard from "../../../components/KpiCard";
import { getSavedTrips } from "~/appwrite/trips";
import { loadBookings } from "~/appwrite/admin";
import { dummyTrips } from "~/constants/dummyTrips";
import { active, withBookingStats } from "~/lib/booking";
import { categoryAxis, chartArea, COLORS, legend, valueAxis } from "~/lib/chart-theme";
import { bucket, lastMonths, monthLabel, pctChange, thisVsLast } from "~/lib/stats";
import { MARGINS, rankTrips, recommend } from "~/lib/profit";
import { cn, money, moneyShort } from "~/lib/utils";
import type { Route } from "./+types/analytics";

export const meta = () => [{ title: "Analytics | TravelSphere Admin" }];

const RANGES = [
    { label: "3M", value: 3 },
    { label: "6M", value: 6 },
    { label: "12M", value: 12 },
];

export const clientLoader = async () => {
    const [saved, data] = await Promise.all([getSavedTrips(500), loadBookings()]);
    const trips = withBookingStats(saved, data.bookings);
    // Website bookings are for the sample trips; include the ones that were booked in the profit view
    const bookedSamples = withBookingStats(dummyTrips, data.bookings).filter((t) => t.bookings > 0 || (t.revenue ?? 0) > 0);
    return { trips, profitTrips: [...trips, ...bookedSamples], ...data };
};

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

const Analytics = ({ loaderData }: Route.ComponentProps) => {
    const { trips, profitTrips, bookings, ready, error } = loaderData;
    const [range, setRange] = useState(6);

    /* ---------------- Booking analytics ---------------- */
    const b = useMemo(() => {
        const months = lastMonths(range);
        const labels = months.map((m) => monthLabel(m, range > 6));
        const start = months[0];
        const inRange = bookings.filter((x) => x.createdAt && !start.isAfter(x.createdAt, "month"));

        const dates = bookings.map((x) => ({ date: x.createdAt }));
        const revItems = bookings.filter((x) => x.status === "Confirmed").map((x) => ({ date: x.createdAt, value: x.amount }));
        const countS = bucket(dates, months);
        const revS = bucket(revItems, months);
        const peopleS = bucket(bookings.filter(active).map((x) => ({ date: x.createdAt, value: x.travellers })), months);

        const confirmed = inRange.filter((x) => x.status === "Confirmed");
        const cancelled = inRange.filter((x) => x.status === "Cancelled").length;
        const pending = inRange.filter((x) => x.status === "Pending").length;
        const activeInRange = inRange.filter(active);
        const bT = thisVsLast(dates);
        const rT = thisVsLast(revItems);

        const live = bookings.filter(active);

        // Customers (all time), matched by phone, then email
        const customers = new Map<string, { name: string; phone: string; email: string; bookings: number; people: number; spend: number; last: string }>();
        for (const x of bookings) {
            const key = x.phone || x.email || x.customerName.toLowerCase();
            const c = customers.get(key) ?? { name: x.customerName, phone: x.phone, email: x.email, bookings: 0, people: 0, spend: 0, last: "" };
            c.bookings += 1;
            if (active(x)) {
                c.people += x.travellers;
                c.spend += x.amount;
            }
            if (x.createdAt > c.last) c.last = x.createdAt;
            customers.set(key, c);
        }
        const list = [...customers.values()];
        const repeat = list.filter((c) => c.bookings > 1).length;

        return {
            timeline: labels.map((month, i) => ({ month, bookings: countS[i], revenue: revS[i], people: peopleS[i] })),
            total: inRange.length,
            people: activeInRange.reduce((s, x) => s + x.travellers, 0),
            revenue: confirmed.reduce((s, x) => s + x.amount, 0),
            avgValue: activeInRange.length ? activeInRange.reduce((s, x) => s + x.amount, 0) / activeInRange.length : 0,
            bookingsDelta: pctChange(bT.current, bT.last),
            revenueDelta: pctChange(rT.current, rT.last),
            funnel: [
                { label: "Requests received", value: inRange.length, tone: "bg-primary-100" },
                { label: "Still active (not cancelled)", value: inRange.length - cancelled, tone: "bg-violet-500" },
                { label: "Confirmed", value: confirmed.length, tone: "bg-success-500" },
            ],
            status: [
                { x: "Confirmed", y: confirmed.length, color: COLORS.green },
                { x: "Pending", y: pending, color: COLORS.amber },
                { x: "Cancelled", y: cancelled, color: COLORS.gray },
            ].filter((x) => x.y),
            confirmRate: pct(confirmed.length, confirmed.length + cancelled),
            cancelRate: pct(cancelled, inRange.length),
            pending,
            customers: list.length,
            repeat,
            repeatRate: pct(repeat, list.length),
            avgGroup: live.length ? live.reduce((s, x) => s + x.travellers, 0) / live.length : 0,
            topCustomers: list.sort((a, c) => c.spend - a.spend).slice(0, 6),
        };
    }, [range, bookings]);

    const noBookings = !bookings.length ? (ready ? "No bookings yet." : "Bookings are not set up yet. Open Bookings to set them up.") : undefined;

    const noTrips = !trips.length ? "No trips yet. Create one to see this chart." : undefined;

    const p = useMemo(() => {
        const ranked = rankTrips(profitTrips);
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
            ideas: recommend(ranked),
        };
    }, [profitTrips]);

    const verdictStyle = {
        "Make more": "bg-success-50 text-success-700",
        Good: "bg-primary-50 text-primary-100",
        Review: "bg-amber-50 text-amber-600",
    } as const;

    return (
        <main className="dashboard wrapper">
            <span className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <Header title="Analytics" description="Bookings, customers and profit, from your live data." />
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

            {error && <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">Bookings could not be loaded: {error}</p>}

            <ul className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard label="Bookings" value={b.total} note={`${b.people} travellers in range`} delta={b.bookingsDelta} Icon={CalendarCheck} tone="bg-primary-50 text-primary-100" />
                <KpiCard label="Confirmed revenue" value={money(b.revenue)} note="In the selected range" delta={b.revenueDelta} Icon={Wallet} tone="bg-success-50 text-success-700" />
                <KpiCard label="Average booking" value={money(b.avgValue)} note="Value of an active booking" Icon={TrendingUp} tone="bg-violet-50 text-violet-600" />
                <KpiCard label="Confirmation rate" value={`${b.confirmRate}%`} note={`${b.pending} still pending`} Icon={Percent} tone="bg-sky-50 text-sky-600" />
            </ul>

            {/* ---------------- Bookings over time ---------------- */}
            <ChartCard title="Bookings over time" subtitle="Bookings received (bars) and confirmed revenue (line) each month" empty={noBookings}>
                <ChartComponent
                    id="an-timeline"
                    dataSource={b.timeline}
                    primaryXAxis={categoryAxis}
                    primaryYAxis={valueAxis({ minimum: 0, title: "Bookings" })}
                    chartArea={chartArea}
                    tooltip={{ enable: true, shared: true }}
                    legendSettings={legend}
                    background="transparent"
                    height="330px"
                >
                    <AxesDirective>
                        <AxisDirective name="revenue" opposedPosition minimum={0} labelFormat="₹{value}" majorGridLines={{ width: 0 }} lineStyle={{ width: 0 }} majorTickLines={{ width: 0 }} labelStyle={{ color: "#9ca3af", size: "12px" }} />
                    </AxesDirective>
                    <ChartInject services={[ColumnSeries, SplineSeries, Category, Tooltip, Legend]} />
                    <SeriesCollectionDirective>
                        <SeriesDirective dataSource={b.timeline} xName="month" yName="bookings" name="Bookings" type="Column" fill={COLORS.blue} columnWidth={0.45} cornerRadius={{ topLeft: 8, topRight: 8 }} />
                        <SeriesDirective dataSource={b.timeline} xName="month" yName="revenue" yAxisName="revenue" name="Revenue (₹)" type="Spline" fill={COLORS.green} width={3} marker={{ visible: true, width: 8, height: 8, fill: "#ffffff", border: { width: 2, color: COLORS.green } }} />
                    </SeriesCollectionDirective>
                </ChartComponent>
            </ChartCard>

            {/* ---------------- Funnel + status ---------------- */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <article className="xl:col-span-2 bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-5">
                    <header className="flex flex-col gap-0.5">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-dark-100"><Filter size={18} className="text-primary-100" /> Booking funnel</h2>
                        <p className="text-sm text-gray-100">How booking requests turn into confirmed trips, in the selected range</p>
                    </header>
                    {b.total ? (
                        <>
                            <ol className="flex flex-col gap-3">
                                {b.funnel.map((step, i) => (
                                    <li key={step.label} className="flex items-center gap-4">
                                        <span className="w-48 shrink-0 text-sm text-dark-200">{step.label}</span>
                                        <span className="flex-1 h-10 rounded-xl bg-light-200 overflow-hidden">
                                            <span
                                                className={cn("h-full rounded-xl flex items-center px-3 text-sm font-semibold text-white transition-all duration-700", step.tone)}
                                                style={{ width: `${Math.max(8, pct(step.value, b.funnel[0].value))}%` }}
                                            >
                                                {step.value}
                                            </span>
                                        </span>
                                        <span className="w-12 text-right text-sm font-semibold text-dark-100 tabular-nums">{i === 0 ? "100%" : `${pct(step.value, b.funnel[0].value)}%`}</span>
                                    </li>
                                ))}
                            </ol>
                            <ul className="grid grid-cols-3 gap-3 text-center">
                                <li className="rounded-2xl bg-success-50 p-3"><strong className="block text-xl text-success-700">{b.confirmRate}%</strong><small className="text-xs text-dark-200">Confirmed of decided</small></li>
                                <li className="rounded-2xl bg-light-200 p-3"><strong className="block text-xl text-dark-100">{b.cancelRate}%</strong><small className="text-xs text-dark-200">Cancelled</small></li>
                                <li className="rounded-2xl bg-amber-50 p-3"><strong className="block text-xl text-amber-600">{b.pending}</strong><small className="text-xs text-dark-200">Waiting for you</small></li>
                            </ul>
                        </>
                    ) : (
                        <p className="flex items-center justify-center text-center text-sm text-gray-100 bg-light-200 rounded-2xl min-h-[200px] px-6">{noBookings ?? "No bookings in this range."}</p>
                    )}
                </article>

                <ChartCard title="Bookings by status" subtitle="In the selected range" empty={b.status.length ? undefined : noBookings ?? "No bookings in this range."}>
                    <AccumulationChartComponent id="an-status" legendSettings={{ visible: true, position: "Bottom" }} tooltip={{ enable: true, format: "${point.x}: <b>${point.y}</b>" }} background="transparent" height="280px" centerLabel={{ text: `${b.total}<br>bookings`, textStyle: { size: "15px", fontWeight: "700", color: "#111827" } }}>
                        <ChartInject services={[PieSeries, AccumulationLegend, AccumulationTooltip, AccumulationDataLabel]} />
                        <AccumulationSeriesCollectionDirective>
                            <AccumulationSeriesDirective dataSource={b.status} xName="x" yName="y" type="Pie" pointColorMapping="color" radius="85%" innerRadius="65%" border={{ width: 3, color: "#ffffff" }} />
                        </AccumulationSeriesCollectionDirective>
                    </AccumulationChartComponent>
                </ChartCard>
            </section>

            {/* ---------------- Customer insights ---------------- */}
            <section className="flex flex-col gap-6">
                <span className="flex flex-col gap-1">
                    <h2 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-dark-100"><Users size={24} className="text-pink-500" /> Customer insights</h2>
                    <p className="text-sm text-gray-100">Who books with you, all time. Customers are matched by phone number, then email.</p>
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <KpiCard label="Customers" value={b.customers} note="People who booked at least once" Icon={UserRound} tone="bg-pink-50 text-pink-500" />
                    <KpiCard label="Repeat customers" value={`${b.repeatRate}%`} note={`${b.repeat} booked more than once`} Icon={Repeat} tone="bg-violet-50 text-violet-600" />
                    <KpiCard label="Average group size" value={b.avgGroup.toFixed(1)} note="Travellers per booking" Icon={Users} tone="bg-sky-50 text-sky-600" />
                </ul>
                <div className="grid grid-cols-1 gap-6">
                    <article className="bg-white rounded-3xl border border-light-400 shadow-sm p-6 flex flex-col gap-4">
                        <header className="flex flex-col gap-0.5">
                            <h2 className="text-lg font-semibold text-dark-100">Top customers</h2>
                            <p className="text-sm text-gray-100">By total value of active bookings</p>
                        </header>
                        {b.topCustomers.length ? (
                            <ul className="flex flex-col divide-y divide-light-400">
                                {b.topCustomers.map((c, i) => (
                                    <li key={c.phone + c.email + i} className="flex items-center gap-3 py-3">
                                        <span className="size-9 shrink-0 rounded-full bg-primary-50 text-primary-100 flex items-center justify-center text-sm font-bold">{c.name.charAt(0).toUpperCase()}</span>
                                        <span className="flex-1 min-w-0 flex flex-col leading-tight">
                                            <strong className="text-sm font-semibold text-dark-100 truncate">{c.name}</strong>
                                            <small className="text-xs text-gray-100 truncate">{c.phone}{c.email ? ` · ${c.email}` : ""}</small>
                                        </span>
                                        <span className="hidden sm:flex flex-col items-end leading-tight">
                                            <small className="text-xs text-gray-100">{c.bookings} {c.bookings === 1 ? "booking" : "bookings"} · {c.people} people</small>
                                            {c.bookings > 1 && <small className="text-[11px] font-semibold text-violet-600">Repeat customer</small>}
                                        </span>
                                        <strong className="w-24 text-right text-sm tabular-nums text-dark-100">{money(c.spend)}</strong>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="flex items-center justify-center text-center text-sm text-gray-100 bg-light-200 rounded-2xl min-h-[200px] px-6">{noBookings ?? "No customers yet."}</p>
                        )}
                    </article>
                </div>
            </section>



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

                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <KpiCard label="Estimated profit earned" value={money(p.totalProfit)} note={`On ${money(p.totalRevenue)} confirmed revenue`} Icon={PiggyBank} tone="bg-success-50 text-success-700" />
                    <KpiCard label="Average margin" value={`${p.avgMargin}%`} note="Profit as a share of price" Icon={Percent} tone="bg-sky-50 text-sky-600" />
                    <KpiCard label="Trips with bookings" value={`${p.bookedTrips} / ${p.ranked.length}`} note={`${p.totalBookings} people booked`} Icon={Award} tone="bg-amber-50 text-amber-600" />
                </ul>

                {!p.totalBookings && p.ranked.length > 0 && (
                    <p className="rounded-2xl bg-amber-50 text-amber-700 px-5 py-3 text-sm">
                        No confirmed bookings yet, so earnings show ₹0. Confirm booking requests on the <Link to="/bookings" className="font-semibold underline">Bookings</Link> page.
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

                <div className="grid grid-cols-1 gap-6">
                    <ChartCard title="Top trips by profit earned" subtitle="Confirmed revenue, split into cost and profit" empty={!p.top.length ? noTrips ?? "No bookings entered yet." : undefined}>
                        <ChartComponent id="an-profit-top" dataSource={p.top} primaryXAxis={{ ...categoryAxis, isInversed: true }} primaryYAxis={valueAxis({ minimum: 0, labelFormat: "₹{value}" })} chartArea={chartArea} tooltip={{ enable: true, shared: true, format: "${series.name}: <b>₹${point.y}</b>" }} legendSettings={legend} background="transparent" height={`${Math.max(260, p.top.length * 46)}px`}>
                            <ChartInject services={[StackingBarSeries, Category, Tooltip, Legend]} />
                            <SeriesCollectionDirective>
                                <SeriesDirective dataSource={p.top} xName="x" yName="cost" name="Cost" type="StackingBar" fill="#e2e8f0" columnWidth={0.55} />
                                <SeriesDirective dataSource={p.top} xName="x" yName="profit" name="Profit" type="StackingBar" fill={COLORS.green} columnWidth={0.55} cornerRadius={{ topRight: 8, bottomRight: 8 }} />
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

        </main>
    );
};

export default Analytics;

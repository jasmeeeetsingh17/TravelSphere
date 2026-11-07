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
    Tooltip,
} from "@syncfusion/ej2-react-charts";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { ArrowDownRight, ArrowUpRight, BadgeCheck, Sparkles, Ticket, TrendingUp, Users, Wallet, type LucideIcon } from "lucide-react";
import { Header } from "../../../components";
import ChartCard from "../../../components/ChartCard";
import { loadAllBookings } from "~/appwrite/admin";
import { getSavedTrips } from "~/appwrite/trips";
import { getAllUsers } from "~/appwrite/users";
import { money } from "~/lib/booking";
import { categoryAxis, chartArea, COLORS, legend, tooltip, valueAxis } from "~/lib/chart-theme";
import { bucket, countBy, lastMonths, monthLabel, pctChange, thisVsLast } from "~/lib/stats";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/analytics";

/** Share of confirmed booking revenue kept as profit. There is no cost data yet, so profit is an estimate. */
const PROFIT_MARGIN = 0.25;

const RANGES = [
    { text: "Last 3 months", value: 3 },
    { text: "Last 6 months", value: 6 },
    { text: "Last 12 months", value: 12 },
];

export const clientLoader = async () => {
    const [trips, users, { bookings, error }] = await Promise.all([getSavedTrips(500), getAllUsers(500), loadAllBookings()]);
    return { trips, users, bookings, bookingsError: error };
};

type KpiProps = { label: string; value: string | number; note: string; Icon: LucideIcon; tone: string; delta?: number };

const Kpi = ({ label, value, note, Icon, tone, delta }: KpiProps) => (
    <li className="bg-white rounded-3xl border border-light-400 shadow-sm p-5 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
        <span className="flex items-center justify-between">
            <span className={cn("size-11 rounded-2xl flex items-center justify-center", tone)}>
                <Icon size={22} />
            </span>
            {delta !== undefined && (
                <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", delta >= 0 ? "bg-success-50 text-success-700" : "bg-red-50 text-red-500")}>
                    {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(delta)}%
                </span>
            )}
        </span>
        <span className="flex flex-col gap-0.5">
            <small className="text-sm text-gray-100">{label}</small>
            <strong className="text-2xl md:text-3xl font-bold text-dark-100 tabular-nums">{value}</strong>
            <small className="text-xs text-gray-100">{note}</small>
        </span>
    </li>
);

const Analytics = ({ loaderData }: Route.ComponentProps) => {
    const { trips, users, bookings, bookingsError } = loaderData;
    const [range, setRange] = useState(6);

    const d = useMemo(() => {
        const months = lastMonths(range);
        const labels = months.map((m) => monthLabel(m, range > 6));

        const tripDates = trips.map((t) => ({ date: t.createdAt ?? "" }));
        const userDates = users.map((u) => ({ date: u.joinedAt }));
        const bookingDates = bookings.map((b) => ({ date: b.createdAt }));
        const confirmed = bookings.filter((b) => b.status === "Confirmed");
        const revenueItems = confirmed.map((b) => ({ date: b.createdAt, value: b.amount }));

        const tripsSeries = bucket(tripDates, months);
        const usersSeries = bucket(userDates, months);
        const bookingsSeries = bucket(bookingDates, months);
        const revenueSeries = bucket(revenueItems, months);

        const revenue = confirmed.reduce((s, b) => s + b.amount, 0);
        const byTrip = Object.entries(
            confirmed.reduce<Record<string, number>>((acc, b) => {
                acc[b.tripName] = (acc[b.tripName] ?? 0) + b.amount;
                return acc;
            }, {})
        )
            .map(([x, y]) => ({ x: x.length > 24 ? x.slice(0, 22) + "…" : x, y }))
            .sort((a, b) => b.y - a.y)
            .slice(0, 5);

        const rev = thisVsLast(revenueItems);

        return {
            overview: labels.map((month, i) => ({ month, trips: tripsSeries[i], bookings: bookingsSeries[i], users: usersSeries[i] })),
            money: labels.map((month, i) => ({ month, revenue: revenueSeries[i], profit: Math.round(revenueSeries[i] * PROFIT_MARGIN) })),
            status: [
                { x: "Confirmed", y: confirmed.length, color: COLORS.green },
                { x: "Pending", y: bookings.filter((b) => b.status === "Pending").length, color: COLORS.amber },
                { x: "Cancelled", y: bookings.filter((b) => b.status === "Cancelled").length, color: COLORS.gray },
            ],
            byTrip,
            byState: countBy(trips, (t) => t.state ?? "").slice(0, 6),
            revenue,
            confirmed: confirmed.length,
            tripsDelta: pctChange(thisVsLast(tripDates).current, thisVsLast(tripDates).last),
            usersDelta: pctChange(thisVsLast(userDates).current, thisVsLast(userDates).last),
            bookingsDelta: pctChange(thisVsLast(bookingDates).current, thisVsLast(bookingDates).last),
            revenueDelta: pctChange(rev.current, rev.last),
        };
    }, [range, trips, users, bookings]);

    const conversion = bookings.length ? Math.round((d.confirmed / bookings.length) * 100) : 0;

    return (
        <main className="dashboard wrapper">
            <span className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <Header title="Analytics" description="Trips generated, revenue and profit, and how bookings are doing." />
                <div className="md:w-52 [&_.e-input-group-icon]:!static">
                    <DropDownListComponent
                        id="analytics-range"
                        dataSource={RANGES}
                        fields={{ text: "text", value: "value" }}
                        value={range}
                        change={(e) => setRange(Number(e.value) || 6)}
                    />
                </div>
            </span>

            {bookingsError && (
                <p className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">
                    Bookings could not be loaded: {bookingsError}
                </p>
            )}

            <ul className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                <Kpi label="Trips generated" value={trips.length} note="vs last month" delta={d.tripsDelta} Icon={Sparkles} tone="bg-primary-50 text-primary-100" />
                <Kpi label="Bookings" value={bookings.length} note={`${d.confirmed} confirmed`} delta={d.bookingsDelta} Icon={Ticket} tone="bg-amber-50 text-amber-600" />
                <Kpi label="Revenue" value={money(d.revenue)} note="Confirmed bookings" delta={d.revenueDelta} Icon={Wallet} tone="bg-success-50 text-success-700" />
                <Kpi label="Estimated profit" value={money(d.revenue * PROFIT_MARGIN)} note={`At a ${PROFIT_MARGIN * 100}% margin`} Icon={TrendingUp} tone="bg-violet-50 text-violet-600" />
                <Kpi label="Users" value={users.length} note="Registered accounts" delta={d.usersDelta} Icon={Users} tone="bg-pink-50 text-pink-500" />
                <Kpi label="Confirmation rate" value={`${conversion}%`} note="Bookings confirmed" Icon={BadgeCheck} tone="bg-sky-50 text-sky-600" />
            </ul>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartCard
                    className="xl:col-span-2"
                    title="Activity overview"
                    subtitle="New trips, bookings and users each month"
                    empty={!trips.length && !bookings.length && !users.length ? "No activity yet." : undefined}
                >
                    <ChartComponent id="an-overview" dataSource={d.overview} primaryXAxis={categoryAxis} primaryYAxis={valueAxis({ minimum: 0, interval: 1 })} chartArea={chartArea} tooltip={tooltip} legendSettings={legend} background="transparent" height="320px">
                        <ChartInject services={[SplineAreaSeries, Category, Tooltip, Legend]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={d.overview} xName="month" yName="trips" name="Trips" type="SplineArea" fill={COLORS.blue} opacity={0.15} border={{ width: 3, color: COLORS.blue }} marker={{ visible: true, width: 8, height: 8, fill: "#ffffff", border: { width: 2, color: COLORS.blue } }} />
                            <SeriesDirective dataSource={d.overview} xName="month" yName="bookings" name="Bookings" type="SplineArea" fill={COLORS.amber} opacity={0.15} border={{ width: 3, color: COLORS.amber }} marker={{ visible: true, width: 8, height: 8, fill: "#ffffff", border: { width: 2, color: COLORS.amber } }} />
                            <SeriesDirective dataSource={d.overview} xName="month" yName="users" name="Users" type="SplineArea" fill={COLORS.pink} opacity={0.15} border={{ width: 3, color: COLORS.pink }} marker={{ visible: true, width: 8, height: 8, fill: "#ffffff", border: { width: 2, color: COLORS.pink } }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>

                <ChartCard
                    title="Revenue and estimated profit"
                    subtitle={`Confirmed bookings. Profit assumes a ${PROFIT_MARGIN * 100}% margin.`}
                    empty={!d.confirmed ? "No confirmed bookings yet. Confirm a booking to see revenue here." : undefined}
                >
                    <ChartComponent id="an-money" dataSource={d.money} primaryXAxis={categoryAxis} primaryYAxis={valueAxis({ minimum: 0, labelFormat: "${value}" })} chartArea={chartArea} tooltip={tooltip} legendSettings={legend} background="transparent" height="300px">
                        <ChartInject services={[ColumnSeries, Category, Tooltip, Legend]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={d.money} xName="month" yName="revenue" name="Revenue" type="Column" fill={COLORS.blue} columnWidth={0.6} cornerRadius={{ topLeft: 8, topRight: 8 }} />
                            <SeriesDirective dataSource={d.money} xName="month" yName="profit" name="Profit" type="Column" fill={COLORS.green} columnWidth={0.6} cornerRadius={{ topLeft: 8, topRight: 8 }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>

                <ChartCard title="Bookings by status" subtitle="How many requests are waiting, confirmed or cancelled" empty={!bookings.length ? "No bookings yet." : undefined}>
                    <AccumulationChartComponent id="an-status" legendSettings={{ visible: true, position: "Bottom" }} tooltip={{ enable: true }} background="transparent" height="300px" centerLabel={{ text: `${bookings.length}\nbookings`, textStyle: { size: "16px", fontWeight: "700", color: "#111827" } }}>
                        <ChartInject services={[PieSeries, AccumulationLegend, AccumulationTooltip, AccumulationDataLabel]} />
                        <AccumulationSeriesCollectionDirective>
                            <AccumulationSeriesDirective dataSource={d.status} xName="x" yName="y" type="Pie" pointColorMapping="color" radius="85%" innerRadius="62%" explode explodeOffset="4%" dataLabel={{ visible: true, name: "y", position: "Outside", font: { fontWeight: "600" } }} />
                        </AccumulationSeriesCollectionDirective>
                    </AccumulationChartComponent>
                </ChartCard>

                <ChartCard title="Top trips by revenue" subtitle="Best earners among confirmed bookings" empty={!d.byTrip.length ? "No confirmed bookings yet." : undefined}>
                    <ChartComponent id="an-top" dataSource={d.byTrip} primaryXAxis={{ ...categoryAxis, isInversed: true }} primaryYAxis={valueAxis({ minimum: 0, labelFormat: "${value}" })} chartArea={chartArea} tooltip={{ enable: true }} background="transparent" height="300px">
                        <ChartInject services={[BarSeries, Category, Tooltip, DataLabel]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={d.byTrip} xName="x" yName="y" name="Revenue" type="Bar" fill={COLORS.violet} columnWidth={0.5} cornerRadius={{ topRight: 8, bottomRight: 8 }} marker={{ dataLabel: { visible: true, position: "Outer", format: "${point.y}", font: { fontWeight: "600", color: "#374151" } } }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>

                <ChartCard title="Popular states" subtitle="Where trips are being planned" empty={!d.byState.length ? "No trips yet. Create one to see this chart." : undefined}>
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

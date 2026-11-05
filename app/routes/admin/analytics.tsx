import dayjs from "dayjs";
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
    BarSeries,
    DataLabel,
    Inject as ChartInject,
    Legend,
    PieSeries,
    SeriesCollectionDirective,
    SeriesDirective,
    Tooltip,
} from "@syncfusion/ej2-react-charts";
import { Header } from "../../../components";
import { getAllUsers } from "~/appwrite/users";
import { getSavedTrips } from "~/appwrite/trips";
import { bookings, PROFIT_MARGIN } from "~/constants/bookings";
import { sampleTripViews } from "~/lib/trip-view";
import type { Route } from "./+types/analytics";

export const clientLoader = async () => {
    const [saved, users] = await Promise.all([getSavedTrips(200), getAllUsers(200)]);
    return { savedDates: saved.map((t) => t.createdAt ?? ""), users: users.length };
};

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const cardClass = "bg-white rounded-20 shadow-400 p-6 flex flex-col gap-4";

// ---- Bookings (sample data): revenue, profit, status, top trips ----
const confirmed = bookings.filter((b) => b.status === "Confirmed");
const revenue = confirmed.reduce((sum, b) => sum + b.amount, 0);
const profit = revenue * PROFIT_MARGIN;

const revenueByMonth = Object.entries(
    confirmed.reduce<Record<string, number>>((acc, b) => {
        const key = b.date.slice(0, 7);
        acc[key] = (acc[key] ?? 0) + b.amount;
        return acc;
    }, {})
)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => ({ month: dayjs(key + "-01").format("MMM YYYY"), revenue: amount, profit: Math.round(amount * PROFIT_MARGIN) }));

const statusData = (["Confirmed", "Pending", "Cancelled"] as const).map((s) => ({
    x: s,
    y: bookings.filter((b) => b.status === s).length,
}));

const topTrips = Object.entries(
    confirmed.reduce<Record<string, number>>((acc, b) => {
        acc[b.trip] = (acc[b.trip] ?? 0) + b.amount;
        return acc;
    }, {})
)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([x, y]) => ({ x, y }));

const Analytics = ({ loaderData }: Route.ComponentProps) => {
    const { savedDates, users } = loaderData;

    // Trips generated per month for the last 6 months, from trips saved in Appwrite
    const months = Array.from({ length: 6 }, (_, i) => dayjs().subtract(5 - i, "month"));
    const tripsPerMonth = months.map((m) => ({
        month: m.format("MMM"),
        trips: savedDates.filter((d) => d && dayjs(d).isSame(m, "month")).length,
    }));

    const kpis = [
        { label: "Trips generated", value: savedDates.length, note: "Saved in Appwrite" },
        { label: "Total trips", value: savedDates.length + sampleTripViews.length, note: "Generated + sample trips" },
        { label: "Revenue", value: money(revenue), note: "Confirmed bookings" },
        { label: "Estimated profit", value: money(profit), note: `${PROFIT_MARGIN * 100}% margin` },
        { label: "Bookings", value: bookings.length, note: `${confirmed.length} confirmed` },
        { label: "Users", value: users, note: "Registered accounts" },
    ];

    return (
        <main className="dashboard wrapper">
            <Header
                title="Analytics"
                description="Trips generated, revenue and profit, and how bookings are doing."
            />

            <ul className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                {kpis.map(({ label, value, note }) => (
                    <li key={label} className="bg-white rounded-20 shadow-400 p-6 flex flex-col gap-1">
                        <span className="text-sm text-gray-100">{label}</span>
                        <strong className="text-2xl md:text-3xl font-bold text-dark-100">{value}</strong>
                        <small className="text-gray-100">{note}</small>
                    </li>
                ))}
            </ul>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <article className={cardClass}>
                    <h2 className="text-lg font-semibold text-dark-100">Trips generated (last 6 months)</h2>
                    <ChartComponent
                        id="trips-generated-chart"
                        dataSource={tripsPerMonth}
                        primaryXAxis={{ valueType: "Category", majorGridLines: { width: 0 } }}
                        primaryYAxis={{ minimum: 0, interval: 1, title: "Trips" }}
                        tooltip={{ enable: true }}
                        height="300px"
                    >
                        <ChartInject services={[ColumnSeries, Category, Tooltip, DataLabel]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective
                                dataSource={tripsPerMonth}
                                xName="month"
                                yName="trips"
                                type="Column"
                                name="Trips"
                                columnWidth={0.5}
                                cornerRadius={{ topLeft: 8, topRight: 8 }}
                                marker={{ dataLabel: { visible: true, position: "Top" } }}
                            />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                    {!savedDates.length && (
                        <p className="text-sm text-gray-100">No trips generated yet. Create one from the Create Trip page and it will show up here.</p>
                    )}
                </article>

                <article className={cardClass}>
                    <h2 className="text-lg font-semibold text-dark-100">Revenue and estimated profit</h2>
                    <ChartComponent
                        id="revenue-chart"
                        dataSource={revenueByMonth}
                        primaryXAxis={{ valueType: "Category", majorGridLines: { width: 0 } }}
                        primaryYAxis={{ labelFormat: "${value}", title: "USD" }}
                        tooltip={{ enable: true }}
                        legendSettings={{ visible: true }}
                        height="300px"
                    >
                        <ChartInject services={[ColumnSeries, Category, Tooltip, Legend]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={revenueByMonth} xName="month" yName="revenue" type="Column" name="Revenue" columnWidth={0.6} cornerRadius={{ topLeft: 6, topRight: 6 }} />
                            <SeriesDirective dataSource={revenueByMonth} xName="month" yName="profit" type="Column" name="Profit" columnWidth={0.6} cornerRadius={{ topLeft: 6, topRight: 6 }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                    <p className="text-sm text-gray-100">Based on sample bookings. Profit assumes a {PROFIT_MARGIN * 100}% margin.</p>
                </article>

                <article className={cardClass}>
                    <h2 className="text-lg font-semibold text-dark-100">Bookings by status</h2>
                    <AccumulationChartComponent
                        id="status-chart"
                        legendSettings={{ visible: true }}
                        tooltip={{ enable: true }}
                        height="300px"
                    >
                        <ChartInject services={[PieSeries, AccumulationLegend, AccumulationTooltip, AccumulationDataLabel]} />
                        <AccumulationSeriesCollectionDirective>
                            <AccumulationSeriesDirective
                                dataSource={statusData}
                                xName="x"
                                yName="y"
                                type="Pie"
                                radius="80%"
                                innerRadius="40%"
                                dataLabel={{ visible: true, name: "x", position: "Outside" }}
                            />
                        </AccumulationSeriesCollectionDirective>
                    </AccumulationChartComponent>
                </article>

                <article className={cardClass}>
                    <h2 className="text-lg font-semibold text-dark-100">Top trips by revenue</h2>
                    <ChartComponent
                        id="top-trips-chart"
                        dataSource={topTrips}
                        primaryXAxis={{ valueType: "Category", majorGridLines: { width: 0 } }}
                        primaryYAxis={{ labelFormat: "${value}" }}
                        tooltip={{ enable: true }}
                        height="300px"
                    >
                        <ChartInject services={[BarSeries, Category, Tooltip, DataLabel]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective
                                dataSource={topTrips}
                                xName="x"
                                yName="y"
                                type="Bar"
                                name="Revenue"
                                columnWidth={0.5}
                                cornerRadius={{ topRight: 6, bottomRight: 6 }}
                                marker={{ dataLabel: { visible: true, position: "Outer" } }}
                            />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </article>
            </section>
        </main>
    );
};

export default Analytics;

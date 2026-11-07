import { Link } from "react-router";
import {
    Category,
    ChartComponent,
    ColumnSeries,
    DataLabel,
    Inject as ChartInject,
    Legend,
    SeriesCollectionDirective,
    SeriesDirective,
    SplineAreaSeries,
    Tooltip,
} from "@syncfusion/ej2-react-charts";
import { ColumnDirective, ColumnsDirective, GridComponent } from "@syncfusion/ej2-react-grids";
import { Plus } from "lucide-react";
import { Header, StatsCard, TripCard } from "../../../components";
import ChartCard from "../../../components/ChartCard";
import { nameCell } from "../../../components/UserCells";
import { loadAllBookings } from "~/appwrite/admin";
import { getUser } from "~/appwrite/auth";
import { getSavedTrips } from "~/appwrite/trips";
import { getAllUsers } from "~/appwrite/users";
import { categoryAxis, chartArea, COLORS, legend, tooltip, valueAxis } from "~/lib/chart-theme";
import { bucket, countBy, lastMonths, monthLabel, thisVsLast } from "~/lib/stats";
import type { Route } from "./+types/dashboard";

export const clientLoader = async () => {
    const [user, users, trips, { bookings }] = await Promise.all([
        getUser(),
        getAllUsers(500),
        getSavedTrips(500),
        loadAllBookings(),
    ]);
    return { user, users, trips, bookings };
};

const Dashboard = ({ loaderData }: Route.ComponentProps) => {
    const { user, users, trips, bookings } = loaderData;
    const name = user && !(user instanceof Response) ? user.name : "Guest";

    const userDates = users.map((u) => ({ date: u.joinedAt }));
    const tripDates = trips.map((t) => ({ date: t.createdAt ?? "" }));
    const bookingDates = bookings.map((b) => ({ date: b.createdAt }));

    const months = lastMonths(6);
    const growth = months.map((m, i) => ({
        month: monthLabel(m),
        users: bucket(userDates, months)[i],
        trips: bucket(tripDates, months)[i],
        bookings: bucket(bookingDates, months)[i],
    }));
    const byGroup = countBy(trips, (t) => t.group);

    const cards = [
        { title: "Total Users", total: users.length, ...thisVsLast(userDates) },
        { title: "Total Trips", total: trips.length, ...thisVsLast(tripDates) },
        { title: "Total Bookings", total: bookings.length, ...thisVsLast(bookingDates) },
    ];

    return (
        <main className="dashboard wrapper">
            <Header title={`Welcome ${name} 👋`} description="Track activity, trends and popular destinations in real time" />

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {cards.map((c) => (
                    <StatsCard key={c.title} headerTitle={c.title} total={c.total} currentMonthCount={c.current} lastMonthCount={c.last} />
                ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartCard title="Growth overview" subtitle="New users, trips and bookings over the last 6 months" empty={!users.length && !trips.length && !bookings.length ? "Nothing to show yet." : undefined}>
                    <ChartComponent id="dash-growth" dataSource={growth} primaryXAxis={categoryAxis} primaryYAxis={valueAxis({ minimum: 0, interval: 1 })} chartArea={chartArea} tooltip={tooltip} legendSettings={legend} background="transparent" height="300px">
                        <ChartInject services={[SplineAreaSeries, Category, Tooltip, Legend]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={growth} xName="month" yName="users" name="Users" type="SplineArea" fill={COLORS.blue} opacity={0.15} border={{ width: 3, color: COLORS.blue }} />
                            <SeriesDirective dataSource={growth} xName="month" yName="trips" name="Trips" type="SplineArea" fill={COLORS.green} opacity={0.15} border={{ width: 3, color: COLORS.green }} />
                            <SeriesDirective dataSource={growth} xName="month" yName="bookings" name="Bookings" type="SplineArea" fill={COLORS.amber} opacity={0.15} border={{ width: 3, color: COLORS.amber }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>

                <ChartCard title="Trips by group type" subtitle="Who the trips are planned for" empty={!trips.length ? "No trips yet. Create one to see this chart." : undefined}>
                    <ChartComponent id="dash-groups" dataSource={byGroup} primaryXAxis={categoryAxis} primaryYAxis={valueAxis({ minimum: 0, interval: 1 })} chartArea={chartArea} tooltip={{ enable: true }} background="transparent" height="300px">
                        <ChartInject services={[ColumnSeries, Category, Tooltip, DataLabel]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={byGroup} xName="x" yName="y" name="Trips" type="Column" fill={COLORS.blue} columnWidth={0.45} cornerRadius={{ topLeft: 10, topRight: 10 }} marker={{ dataLabel: { visible: true, position: "Top", font: { fontWeight: "600", color: "#374151" } } }} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </ChartCard>
            </section>

            <ChartCard title="Latest user signups" subtitle="The five most recent people to join" empty={!users.length ? "No users yet." : undefined}>
                <GridComponent dataSource={users.slice(0, 5)} gridLines="None">
                    <ColumnsDirective>
                        <ColumnDirective field="name" headerText="Name" width="220" template={nameCell} />
                        <ColumnDirective field="email" headerText="Email" width="240" />
                        <ColumnDirective field="dateJoined" headerText="Date Joined" width="150" />
                    </ColumnsDirective>
                </GridComponent>
            </ChartCard>

            <section className="container">
                <span className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold text-dark-100">Latest Trips</h1>
                    <Link to="/trips/create" className="flex items-center gap-2 bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-5 py-2.5 transition-colors">
                        <Plus size={16} /> Create trip
                    </Link>
                </span>

                {trips.length ? (
                    <div className="trip-grid">
                        {trips.slice(0, 4).map((t) => (
                            <TripCard key={t.id} id={t.id} name={t.name} imageUrl={t.imageUrl} location={t.location} tags={t.tags} price={t.price} />
                        ))}
                    </div>
                ) : (
                    <p className="bg-white rounded-3xl border border-light-400 text-center text-gray-100 py-12">No trips yet.</p>
                )}
            </section>
        </main>
    );
};

export default Dashboard;

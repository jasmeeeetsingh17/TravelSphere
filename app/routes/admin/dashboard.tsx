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
import { Link } from "react-router";
import { ColumnDirective, ColumnsDirective, GridComponent } from "@syncfusion/ej2-react-grids";
import { Plus } from "lucide-react";
import { Header, StatsCard, TripCard } from "../../../components";
import { nameCell } from "../../../components/UserCells";
import { dashboardStats, chartOneData, tripXAxis, tripyAxis, userXAxis, useryAxis, users as sampleUsers } from "~/constants";
import { getUser } from "~/appwrite/auth";
import { getAllUsers, type UserRow } from "~/appwrite/users";
import { getSavedTrips } from "~/appwrite/trips";
import { sampleTripViews, type TripView } from "~/lib/trip-view";
import type { Route } from './+types/dashboard';

const { totalUsers, usersJoined, totalTrips, tripsCreated, userRole } = dashboardStats;

export const clientLoader = async () => {
    const [user, users, savedTrips] = await Promise.all([getUser(), getAllUsers(5), getSavedTrips(100)]);
    // Falls back to sample users when the collection is empty or can't be read.
    return { user, users: users.length ? users : (sampleUsers as unknown as UserRow[]), savedTrips };
};

// Number of trips per group type, from saved and sample trips
const countByGroup = (trips: TripView[]) =>
    Object.entries(
        trips.reduce<Record<string, number>>((acc, t) => {
            acc[t.group] = (acc[t.group] ?? 0) + 1;
            return acc;
        }, {})
    ).map(([x, y]) => ({ x, y }));

const cardClass = "bg-white rounded-20 shadow-400 p-6 flex flex-col gap-4";

const Dashboard = ({ loaderData }: Route.ComponentProps) => {
    const { user, users, savedTrips } = loaderData as { user: User | null; users: UserRow[]; savedTrips: TripView[] };
    const tripsByStyle = countByGroup([...savedTrips, ...sampleTripViews]);
    const latestTrips = [...savedTrips, ...sampleTripViews].slice(0, 4);

    return (
        <main className="dashboard wrapper">
            <Header
                title={`Welcome ${user?.name ?? 'Guest'} 👋`}
                description="Track activity, trends and popular destinations in real time"
            />

            <section className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <StatsCard
                        headerTitle="Total Users"
                        total={totalUsers}
                        currentMonthCount={usersJoined.currentMonth}
                        lastMonthCount={usersJoined.lastMonth}
                    />
                    <StatsCard
                        headerTitle="Total Trips"
                        total={totalTrips}
                        currentMonthCount={tripsCreated.currentMonth}
                        lastMonthCount={tripsCreated.lastMonth}
                    />
                    <StatsCard
                        headerTitle="Active Users"
                        total={userRole.total}
                        currentMonthCount={userRole.currentMonth}
                        lastMonthCount={userRole.lastMonth}
                    />
                </div>
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <article className={cardClass}>
                    <h2 className="text-lg font-semibold text-dark-100">Growth overview</h2>
                    <ChartComponent
                        id="growth-chart"
                        dataSource={chartOneData}
                        primaryXAxis={{ ...userXAxis, title: "Month" }}
                        primaryYAxis={useryAxis}
                        tooltip={{ enable: true }}
                        legendSettings={{ visible: true }}
                        height="300px"
                    >
                        <ChartInject services={[SplineAreaSeries, Category, Tooltip, Legend]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={chartOneData} xName="x" yName="y1" name="Users" type="SplineArea" opacity={0.4} />
                            <SeriesDirective dataSource={chartOneData} xName="x" yName="y2" name="Trips" type="SplineArea" opacity={0.4} />
                            <SeriesDirective dataSource={chartOneData} xName="x" yName="y3" name="Bookings" type="SplineArea" opacity={0.4} />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </article>

                <article className={cardClass}>
                    <h2 className="text-lg font-semibold text-dark-100">Trips by group type</h2>
                    <ChartComponent
                        id="style-chart"
                        dataSource={tripsByStyle}
                        primaryXAxis={tripXAxis}
                        primaryYAxis={tripyAxis}
                        tooltip={{ enable: true }}
                        height="300px"
                    >
                        <ChartInject services={[ColumnSeries, Category, Tooltip, DataLabel]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective
                                dataSource={tripsByStyle}
                                xName="x"
                                yName="y"
                                type="Column"
                                name="Trips"
                                columnWidth={0.5}
                                cornerRadius={{ topLeft: 8, topRight: 8 }}
                                marker={{ dataLabel: { visible: true, position: "Top" } }}
                            />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </article>
            </section>

            {/* Latest signups */}
            <section className={cardClass}>
                <h2 className="text-lg font-semibold text-dark-100">Latest user signups</h2>
                <GridComponent dataSource={users} gridLines="None">
                    <ColumnsDirective>
                        <ColumnDirective field="name" headerText="Name" width="220" template={nameCell} />
                        <ColumnDirective field="email" headerText="Email" width="240" />
                        <ColumnDirective field="dateJoined" headerText="Date Joined" width="150" />
                    </ColumnsDirective>
                </GridComponent>
            </section>

            <section className="container">
                <span className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold text-dark-100">{savedTrips.length ? "Latest Trips" : "Sample Trips"}</h1>
                    <Link to="/trips/create" className="flex items-center gap-2 bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-5 py-2.5 transition-colors">
                        <Plus size={16} /> Create trip
                    </Link>
                </span>

                <div className='trip-grid'>
                    {latestTrips.map((t) => (
                        <TripCard
                            key={t.id}
                            id={t.id}
                            name={t.name}
                            imageUrl={t.imageUrl}
                            location={t.location}
                            tags={t.tags}
                            price={t.price}
                        />
                    ))}
                </div>
            </section>
        </main>
    )
}
export default Dashboard

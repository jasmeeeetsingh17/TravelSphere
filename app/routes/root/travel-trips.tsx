import { Header } from "../../../components";
import TripsExplorer from "../../../components/TripsExplorer";

const TravelTrips = () => (
    <main className="wrapper pt-28 pb-20 flex flex-col gap-10">
        <Header
            title="Explore All Trips"
            description="Search by place or interest and filter by travel style to find your next trip."
        />
        <TripsExplorer />
    </main>
);

export default TravelTrips;
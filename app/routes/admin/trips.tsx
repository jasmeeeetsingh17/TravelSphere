import { Header } from "../../../components";
import TripsExplorer from "../../../components/TripsExplorer";

const Trips = () => (
    <main className="dashboard wrapper">
        <Header
            title="Trips"
            description="View and search all trips, then open one to see its itinerary."
        />
        <TripsExplorer />
    </main>
);

export default Trips;
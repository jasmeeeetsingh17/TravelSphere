import { Header } from "../../../components";
import TripsExplorer from "../../../components/TripsExplorer";
import { getAllTripViews } from "~/appwrite/trips";
import type { Route } from "./+types/travel-trips";

export const clientLoader = async () => await getAllTripViews();

const TravelTrips = ({ loaderData }: Route.ComponentProps) => (
    <main className="wrapper pt-28 pb-20 flex flex-col gap-10">
        <Header
            title="Explore All Trips"
            description="Search by place or interest and filter by group to find your next trip."
        />
        <TripsExplorer trips={loaderData} basePath="/travel" />
    </main>
);

export default TravelTrips;

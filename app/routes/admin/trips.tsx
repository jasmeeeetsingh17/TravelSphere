import { Link } from "react-router";
import { Plus } from "lucide-react";
import { Header } from "../../../components";
import TripsExplorer from "../../../components/TripsExplorer";
import { getSavedTrips } from "~/appwrite/trips";
import type { Route } from "./+types/trips";

export const meta = () => [{ title: "Trips | TravelSphere Admin" }];

export const clientLoader = async () => await getSavedTrips(200);

const Trips = ({ loaderData }: Route.ComponentProps) => (
    <main className="dashboard wrapper">
        <span className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <Header title={`Trips (${loaderData.length})`} description="Search all trips, then open one to see its itinerary or delete it." />
            <Link to="/trips/create" className="flex items-center justify-center gap-2 bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-6 py-3 shadow-md shadow-primary-100/30 transition-colors shrink-0">
                <Plus size={16} /> Create trip
            </Link>
        </span>
        <TripsExplorer trips={loaderData} basePath="/trips" />
    </main>
);

export default Trips;

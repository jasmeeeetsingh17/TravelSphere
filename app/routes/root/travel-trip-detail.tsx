import TripDetail from "../../../components/TripDetail";
import { resolveTrip } from "~/appwrite/trips";
import type { Route } from "./+types/travel-trip-detail";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => await resolveTrip(params.tripId);

const TravelTripDetail = ({ loaderData }: Route.ComponentProps) => (
    <main className="wrapper pt-28 pb-20">
        <TripDetail trip={loaderData} backTo="/travel" showAi />
    </main>
);

export default TravelTripDetail;

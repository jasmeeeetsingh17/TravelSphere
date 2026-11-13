import TripDetail from "../../../components/TripDetail";
import { getDummyTrip } from "~/constants/dummyTrips";
import type { Route } from "./+types/travel-trip-detail";

export const meta = ({ params }: Route.MetaArgs) => [
    { title: `${getDummyTrip(params.tripId)?.name ?? "Trip"} | TravelSphere` },
];

const TravelTripDetail = ({ params }: Route.ComponentProps) => (
    <main className="wrapper pt-28 pb-20">
        <TripDetail trip={getDummyTrip(params.tripId)} backTo="/travel" showAi />
    </main>
);

export default TravelTripDetail;

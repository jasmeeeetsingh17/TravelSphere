import BookTrip from "../../../components/BookTrip";
import TripDetail from "../../../components/TripDetail";
import { getDummyTrip } from "~/constants/dummyTrips";
import type { Route } from "./+types/travel-trip-detail";

export const meta = ({ params }: Route.MetaArgs) => [
    { title: `${getDummyTrip(params.tripId)?.name ?? "Trip"} | TravelSphere` },
];

const TravelTripDetail = ({ params }: Route.ComponentProps) => {
    const trip = getDummyTrip(params.tripId);
    return (
        <main className="wrapper pt-28 pb-20">
            <TripDetail trip={trip} backTo="/travel" showAi actions={trip && <BookTrip trip={trip} />} />
        </main>
    );
};

export default TravelTripDetail;

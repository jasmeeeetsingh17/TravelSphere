import TripDetail from "../../../components/TripDetail";
import { getUser } from "~/appwrite/auth";
import { resolveTrip } from "~/appwrite/trips";
import type { BookingUser } from "../../../components/BookTrip";
import type { Route } from "./+types/travel-trip-detail";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
    const [trip, user] = await Promise.all([resolveTrip(params.tripId), getUser()]);
    const bookingUser: BookingUser | null =
        user && !(user instanceof Response)
            ? { accountId: user.accountId, name: user.name, email: user.email }
            : null;
    return { trip, bookingUser };
};

const TravelTripDetail = ({ loaderData }: Route.ComponentProps) => (
    <main className="wrapper pt-28 pb-20">
        <TripDetail trip={loaderData.trip} backTo="/travel" showAi showBooking bookingUser={loaderData.bookingUser} />
    </main>
);

export default TravelTripDetail;

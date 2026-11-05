import TripDetail from "../../../components/TripDetail";
import { resolveTrip } from "~/appwrite/trips";
import type { Route } from "./+types/trip-detail";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => await resolveTrip(params.tripId);

const AdminTripDetail = ({ loaderData }: Route.ComponentProps) => (
    <main className="dashboard wrapper">
        <TripDetail trip={loaderData} backTo="/trips" />
    </main>
);

export default AdminTripDetail;

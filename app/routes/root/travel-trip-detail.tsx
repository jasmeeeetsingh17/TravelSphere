import { useParams } from "react-router";
import TripDetail from "../../../components/TripDetail";

const TravelTripDetail = () => {
    const { tripId } = useParams();
    return (
        <main className="wrapper pt-28 pb-20">
            <TripDetail tripId={tripId} />
        </main>
    );
};

export default TravelTripDetail;
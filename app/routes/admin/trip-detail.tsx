import { useParams } from "react-router";
import TripDetail from "../../../components/TripDetail";

const AdminTripDetail = () => {
    const { tripId } = useParams();
    return (
        <main className="dashboard wrapper">
            <TripDetail tripId={tripId} />
        </main>
    );
};

export default AdminTripDetail;
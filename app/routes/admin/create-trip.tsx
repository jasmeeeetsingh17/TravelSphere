import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import CreateTripForm from "../../../components/CreateTripForm";

export const meta = () => [{ title: "Create trip | TravelSphere Admin" }];

const CreateTrip = () => (
    <main className="dashboard wrapper">
        <span className="flex flex-col gap-2">
            <Link to="/trips" className="flex items-center gap-2 text-sm font-medium text-gray-100 hover:text-primary-100 w-fit">
                <ArrowLeft size={16} /> All trips
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-100">Create a new trip</h1>
            <p className="text-sm md:text-base text-gray-100">
                Make a few choices and AI builds a day-by-day itinerary with timings, weather and a price in rupees. You can edit everything afterwards.
            </p>
        </span>
        <CreateTripForm basePath="/trips" />
    </main>
);

export default CreateTrip;

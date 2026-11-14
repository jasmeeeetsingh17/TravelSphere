import { Link } from "react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import CreateTripForm from "../../../components/CreateTripForm";

export const meta = () => [{ title: "AI Trip Planner | TravelSphere Admin" }];

const CreateTrip = () => (
    <main className="dashboard wrapper">
        <span className="flex flex-col gap-2">
            <Link to="/trips" className="flex items-center gap-2 text-sm font-medium text-gray-100 hover:text-primary-100 w-fit">
                <ArrowLeft size={16} /> All trips
            </Link>
            <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-dark-100">
                <Sparkles size={26} className="text-primary-100" /> AI Trip Planner
            </h1>
            <p className="text-sm md:text-base text-gray-100">
                Make a few choices and AI builds a day-by-day itinerary with timings, weather and a price in rupees. Review it, try another version if you like, then save it as a trip.
            </p>
        </span>
        <CreateTripForm basePath="/trips" />
    </main>
);

export default CreateTrip;

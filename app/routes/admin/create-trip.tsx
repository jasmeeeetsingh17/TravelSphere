import { Header } from "../../../components";
import CreateTripForm from "../../../components/CreateTripForm";

const CreateTrip = () => (
    <main className="dashboard wrapper">
        <Header
            title="Create a New Trip"
            description="Pick a country, style and interests. A day-by-day itinerary is generated and saved for you."
        />
        <CreateTripForm basePath="/trips" />
    </main>
);

export default CreateTrip;

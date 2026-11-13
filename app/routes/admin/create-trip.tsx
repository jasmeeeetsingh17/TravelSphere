import { Header } from "../../../components";
import CreateTripForm from "../../../components/CreateTripForm";

const CreateTrip = () => (
    <main className="dashboard wrapper">
        <Header
            title="Create a New Trip"
            description="Pick a state, style and interests. A day-by-day itinerary is generated with AI and saved."
        />
        <CreateTripForm basePath="/trips" />
    </main>
);

export default CreateTrip;

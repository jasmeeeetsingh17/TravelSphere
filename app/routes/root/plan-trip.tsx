import { redirect } from "react-router";
import { Header } from "../../../components";

import CreateTripForm from "../../../components/CreateTripForm";
import { getUser } from "~/appwrite/auth";

// Only signed-in users can plan a trip
export const clientLoader = async () => (await getUser()) ?? redirect("/sign-in");

const PlanTrip = () => (
    <main className="wrapper pt-28 pb-20 flex flex-col gap-10">
        <Header
            title="Plan Your Trip"
            description="Tell us where you want to go and what you like. We will build a day-by-day itinerary for you."
        />
        <CreateTripForm basePath="/travel" />
    </main>
);

export default PlanTrip;

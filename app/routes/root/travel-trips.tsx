import { useSearchParams } from "react-router";
import { Header } from "../../../components";
import TripsExplorer from "../../../components/TripsExplorer";
import { dummyTrips } from "~/constants/dummyTrips";

const TravelTrips = () => {
    const [params] = useSearchParams();

    return (
        <main className="wrapper pt-28 pb-20 flex flex-col gap-10">
            <Header
                title="Explore All Trips"
                description="Search by place or interest and filter by group to find your next trip."
            />
            <TripsExplorer key={params.get("q") ?? ""} trips={dummyTrips} basePath="/travel" initialQuery={params.get("q") ?? ""} />
        </main>
    );
};

export default TravelTrips;

import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import BookTrip from "../../../components/BookTrip";
import TripDetail from "../../../components/TripDetail";
import { TripCard } from "../../../components";
import { dummyTrips, getDummyTrip } from "~/constants/dummyTrips";
import type { TripView } from "~/lib/trip-view";
import type { Route } from "./+types/travel-trip-detail";

export const meta = ({ params }: Route.MetaArgs) => {
    const trip = getDummyTrip(params.tripId);
    return [
        { title: `${trip?.name ?? "Trip"} | TravelSphere` },
        ...(trip ? [{ name: "description", content: trip.description }] : []),
    ];
};

/** Trips sharing the same style or state, best matches first. */
const similarTo = (trip: TripView, count = 3) =>
    dummyTrips
        .filter((t) => t.id !== trip.id)
        .map((t) => ({ t, score: (t.style === trip.style ? 2 : 0) + (t.state === trip.state ? 1 : 0) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .map((x) => x.t);

const TravelTripDetail = ({ params }: Route.ComponentProps) => {
    const trip = getDummyTrip(params.tripId);
    const similar = trip ? similarTo(trip) : [];

    return (
        <main className="wrapper pt-28 pb-20 flex flex-col gap-14">
            <TripDetail trip={trip} backTo="/travel" showAi shareable actions={trip && <BookTrip trip={trip} />} />

            {similar.length > 0 && (
                <section className="flex flex-col gap-5">
                    <header className="flex items-end justify-between gap-3">
                        <span className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold text-dark-100">You might also like</h2>
                            <p className="text-sm text-gray-100">More {trip?.style?.toLowerCase()} trips and places nearby.</p>
                        </span>
                        <Link to="/travel" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-100 hover:underline">
                            See all trips <ArrowRight size={15} />
                        </Link>
                    </header>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {similar.map((t) => (
                            <TripCard key={t.id} id={t.id} name={t.name} imageUrl={t.imageUrl} location={t.location} tags={t.tags} price={t.price} href={`/travel/${t.id}`} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
};

export default TravelTripDetail;

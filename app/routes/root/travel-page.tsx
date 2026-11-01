import { useState } from "react";
import { Link } from "react-router";
import { Header, TripCard } from "../../../components";
import { allTrips } from "~/constants";
import { cn } from "~/lib/utils";

const TRIPS_PER_PAGE = 8;

const featuredDestinations = [
    { id: 1, name: "Hawa Mahal", places: 196, image: "/assets/images/card-img-1.png", rating: 4.2 },
    { id: 2, name: "Taj Mahal ", places: 150, image: "/assets/images/card-img-2.png", rating: 4.5 },
    { id: 3, name: "Australia Tour", places: 150, image: "/assets/images/card-img-3.png", rating: 4.3 },
    { id: 4, name: "Australia Tour", places: 150, image: "/assets/images/card-img-4.png", rating: 4.1 },
    { id: 5, name: "Japan Tour", places: 150, image: "/assets/images/card-img-5.png", rating: 4.6 },

];

type FeaturedProps = (typeof featuredDestinations)[number] & { className?: string; large?: boolean };

const FeaturedCard = ({ id, name, places, image, rating, className, large }: FeaturedProps) => (
    <Link
        to={`/travel/${id}`}
        className={cn("relative rounded-[20px] overflow-hidden bg-cover bg-center group", className)}
        style={{ backgroundImage: `url(${image})` }}
    >
        <div className="absolute inset-0 bg-linear200" />
        <span className="price-pill absolute top-3 left-3 flex items-center gap-1">
            <img src="/assets/icons/star.svg" alt="" className="size-3.5" />
            {rating}
        </span>
        <article className="absolute bottom-0 left-0 p-4 md:p-6 text-white flex flex-col gap-1">
            <h2 className={cn("font-semibold", large ? "text-xl md:text-3xl" : "text-sm md:text-lg")}>{name}</h2>
            <figure className="flex items-center gap-1.5">
                <img src="/assets/icons/location-mark.svg" alt="" className="size-4 invert brightness-0" />
                <figcaption className="text-xs md:text-sm">{places} Places</figcaption>
            </figure>
        </article>
    </Link>
);

const TravelPage = () => {
    const [page, setPage] = useState(1);
    // Repeat the sample trips so pagination has something to show until real trips come from Appwrite
    const trips = Array.from({ length: 16 }, (_, i) => {
        const t = allTrips[i % allTrips.length];
        return { ...t, key: `${t.id}-${i}` };
    });
    const totalPages = Math.ceil(trips.length / TRIPS_PER_PAGE);
    const visible = trips.slice((page - 1) * TRIPS_PER_PAGE, page * TRIPS_PER_PAGE);

    return (
        <main className="flex flex-col">
            {/* Hero */}
            <section id="hero" className="travel-hero">
                <div>
                    <section className="wrapper">
                        <article>
                            <h1 className="p-72-bold text-dark-100">Plan Your Trip with Ease</h1>
                            <p>
                                Customize your travel itinerary in minutes — pick your destination,
                                set your preferences, and explore with confidence.
                            </p>
                        </article>
                        <Link
                            to="#trips"
                            className="bg-primary-100 hover:bg-primary-500 text-white font-semibold rounded-lg px-8 py-3 md:w-[240px] w-full text-center transition-colors"
                        >
                            Get Started
                        </Link>
                    </section>
                </div>
            </section>

            {/* Featured destinations */}
            <section id="featured" className="wrapper pt-20 flex flex-col gap-10">
                <Header
                    title="Featured Travel Destinations"
                    description="Check out some of the best places you can visit around the India."
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-5 lg:h-[560px]">
                    <FeaturedCard {...featuredDestinations[0]} large className="lg:col-span-3 lg:row-span-1 min-h-[260px]" />
                    <FeaturedCard {...featuredDestinations[3]} className="lg:col-span-1 lg:row-span-1 min-h-[200px]" />
                    <FeaturedCard {...featuredDestinations[1]} className="lg:col-span-1 min-h-[200px]" />
                    <FeaturedCard {...featuredDestinations[2]} className="lg:col-span-2 min-h-[200px]" />
                    <FeaturedCard {...featuredDestinations[4]} className="lg:col-span-1 min-h-[200px]" />
                </div>
            </section>

            {/* Handpicked trips */}
            <section id="trips" className="wrapper py-20 flex flex-col gap-10">
                <Header
                    title="Handpicked Trips"
                    description="Browse well-planned trips designed for different travel styles and interests."
                />

                <div className="trip-grid">
                    {visible.map(({ key, id, name, imageUrls, itinerary, tags, estimatedPrice }) => (
                        <TripCard
                            key={key}
                            id={id.toString()}
                            name={name}
                            imageUrl={imageUrls[0]}
                            location={itinerary?.[0]?.location ?? ""}
                            tags={tags}
                            price={estimatedPrice}
                        />
                    ))}
                </div>

                <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-light-400 bg-white text-sm font-medium text-dark-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                            key={n}
                            onClick={() => setPage(n)}
                            className={cn(
                                "size-10 rounded-lg text-sm font-medium cursor-pointer",
                                n === page ? "bg-primary-100 text-white" : "bg-white border border-light-400 text-dark-100"
                            )}
                        >
                            {n}
                        </button>
                    ))}

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg border border-light-400 bg-white text-sm font-medium text-dark-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </nav>
            </section>
        </main>
    );
};

export default TravelPage;
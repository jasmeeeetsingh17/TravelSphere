import { useState } from "react";
import { Link } from "react-router";
import { Header, TripCard } from "../../../components";
import { allTrips } from "~/constants";
import { cn } from "~/lib/utils";

const TRIPS_PER_PAGE = 8;

const featuredDestinations = [
    {
        id: 1,
        name: "Hawa Mahal",
        location: "Jaipur, Rajasthan",
        image: "/assets/images/2.jpg",
        rating: 4.8,
    },
    {
        id: 2,
        name: "Taj Mahal",
        location: "Agra, Uttar Pradesh",
        image: "/assets/images/card-img-2.png",
        rating: 4.9,
    },
    {
        id: 3,
        name: "Gateway of India",
        location: "Mumbai, Maharashtra",
        image: "/assets/images/3.jpg",
        rating: 4.7,
    },
    {
        id: 4,
        name: "Golden Temple",
        location: "Amritsar, Punjab",
        image: "/assets/images/7.jpg",
        rating: 4.9,
    },
    {
        id: 5,
        name: "Dal Lake",
        location: "Srinagar, Kashmir",
        image: "/assets/images/10.jpg",
        rating: 4.8,
    },
    {
        id: 6,
        name: "Andaman Island",
        location: "Port Blair",
        image: "/assets/images/13.jpg",
        rating: 4.7,
    }
];

type FeaturedProps = (typeof featuredDestinations)[number] & {
    className?: string;
    large?: boolean;
};
const FeaturedCard = ({ id, name, location, image, rating, className, large }: FeaturedProps) => (
    <Link
        to={`/travel/${id}`}
        className={cn(
            "relative rounded-20 overflow-hidden bg-cover bg-no-repeat group",
            className
        )} style={{
            backgroundImage: `url(${image})`,
            backgroundPosition: large ? "center 30%" : "center center",
        }}>
        <div className="absolute inset-0 bg-linear200" />
        <span className="price-pill absolute top-3 left-3 flex items-center gap-1">
            <img src="/assets/icons/star.svg" alt="" className="size-3.5" />
            {rating}
        </span>
        <article className="absolute bottom-0 left-0 p-4 md:p-6 text-white flex flex-col gap-1">
            <h2 className={cn("font-semibold", large ? "text-xl md:text-3xl" : "text-sm md:text-lg")}>{name}</h2>
            <figure className="flex items-center gap-1.5">
                <img src="/assets/icons/location-mark.svg" alt="" className="size-4 invert brightness-0" />
                <figcaption className="text-xs md:text-sm">{location}</figcaption>
            </figure>
        </article>
    </Link>
);

const TravelPage = () => {
    const [page, setPage] = useState(1);
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
                            className="bg-primary-100 hover:bg-primary-500 text-white font-semibold rounded-lg px-8 py-3 md:w-60 w-full text-center transition-colors"
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
                    description="Discover some of the best places you can visit across India."
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:h-130">

                    {/* Row 1: Large + Small */}
                    <FeaturedCard
                        {...featuredDestinations[0]}
                        large
                        className="lg:col-span-2 min-h-65 lg:h-full"
                    />

                    <FeaturedCard
                        {...featuredDestinations[1]}
                        className="lg:col-span-1 min-h-65 lg:h-full"
                    />

                    {/* Row 2: Small + Large */}
                    <FeaturedCard
                        {...featuredDestinations[2]}
                        className="lg:col-span-1 min-h-65 lg:h-full"
                    />

                    <FeaturedCard
                        {...featuredDestinations[3]}
                        large
                        className="lg:col-span-2 min-h-65 lg:h-full"
                    />

                </div>
            </section>

            {/* Handpicked trips */}
            <section id="trips" className="wrapper py-20 flex flex-col gap-10">
                <Header
                    title="Handpicked Trips"
                    description="Browse well-planned trips designed for different travel styles and interests."
                />

                <div className="trip-grid">
                    {visible.map(({ key, id, name, imageUrls, itinerary, tags }) => (
                        <TripCard
                            key={key}
                            id={id.toString()}
                            name={name}
                            imageUrl={imageUrls[0]}
                            location={itinerary?.[0]?.location ?? ""}
                            tags={tags} price={""} />
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
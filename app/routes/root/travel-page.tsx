import { useState } from "react";
import { Link } from "react-router";
import { Compass, Sparkles, Wallet } from "lucide-react";
import { PagerComponent } from "@syncfusion/ej2-react-grids";
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
                        <aside className="flex flex-wrap items-center gap-3 w-full">
                            <a
                                href="#trips"
                                className="bg-primary-100 hover:bg-primary-500 text-white font-semibold rounded-full px-8 py-3 text-center transition-colors"
                            >
                                Get Started
                            </a>
                            <button
                                onClick={() => window.dispatchEvent(new Event("open-ai-mode"))}
                                className="flex items-center gap-2 bg-white/90 hover:bg-white text-dark-100 font-semibold rounded-full px-6 py-3 shadow transition-colors cursor-pointer"
                            >
                                <Sparkles size={18} className="text-primary-100" />
                                Ask AI
                            </button>
                        </aside>
                    </section>
                </div>
            </section>

            {/* Stats strip */}
            <section className="wrapper -mt-12 relative z-10">
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-3xl shadow-xl border border-light-400 p-6 md:p-8">
                    {[
                        ["120+", "Destinations"],
                        ["5K+", "Trips planned"],
                        ["4.8", "Average rating"],
                        ["24/7", "AI help"],
                    ].map(([value, label]) => (
                        <li key={label} className="flex flex-col items-center text-center gap-1">
                            <strong className="text-2xl md:text-3xl font-bold text-primary-100">{value}</strong>
                            <span className="text-sm text-gray-100">{label}</span>
                        </li>
                    ))}
                </ul>
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
            <section id="trips" className="wrapper pt-20 pb-16 flex flex-col gap-10">
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

                <PagerComponent
                    totalRecordsCount={trips.length}
                    pageSize={TRIPS_PER_PAGE}
                    currentPage={page}
                    click={(args: { currentPage: number }) => setPage(args.currentPage)}
                />

                <Link to="/travel" className="self-center text-primary-100 font-semibold hover:underline">
                    View all trips
                </Link>
            </section>

            {/* Why TravelSphere */}
            <section className="wrapper pb-20 flex flex-col gap-10">
                <Header
                    title="Why TravelSphere"
                    description="Everything you need to plan a trip you will remember."
                />
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { Icon: Sparkles, title: "AI-powered planning", text: "Describe your budget and style and get a tailored itinerary in minutes." },
                        { Icon: Compass, title: "Handpicked trips", text: "Curated experiences for solo travellers, couples, families and friends." },
                        { Icon: Wallet, title: "Clear budgets", text: "See estimated prices upfront so there are no surprises later." },
                    ].map(({ Icon, title, text }) => (
                        <li key={title} className="bg-white rounded-3xl border border-light-400 p-6 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all">
                            <span className="size-12 rounded-2xl bg-primary-50 text-primary-100 flex items-center justify-center">
                                <Icon size={24} />
                            </span>
                            <h3 className="text-lg font-semibold text-dark-100">{title}</h3>
                            <p className="text-sm leading-6 text-gray-100">{text}</p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* CTA */}
            {/* <section className="wrapper pb-20">
                <article className="rounded-3xl bg-gradient-to-r from-primary-100 to-violet-600 text-white p-8 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <span className="flex flex-col gap-2 max-w-xl">
                        <h2 className="text-2xl md:text-4xl font-bold">Ready for your next adventure?</h2>
                        <p className="text-white/80">Ask our AI for ideas, or jump straight into the handpicked trips above.</p>
                    </span>
                    <button
                        onClick={() => window.dispatchEvent(new Event("open-ai-mode"))}
                        className="flex items-center gap-2 bg-white text-primary-100 font-semibold rounded-full px-7 py-3.5 hover:scale-105 transition-transform cursor-pointer"
                    >
                        <Sparkles size={18} />
                        Try AI mode
                    </button>
                </article>
            </section> */}
        </main>
    );
};

export default TravelPage;
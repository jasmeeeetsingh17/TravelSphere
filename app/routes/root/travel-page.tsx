import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Compass, MapPinned, Quote, ShieldCheck, Sparkles, Star, Wallet } from "lucide-react";
import { PagerComponent } from "@syncfusion/ej2-react-grids";
import { Header, TripCard } from "../../../components";
import { dummyTrips, testimonials } from "~/constants/dummyTrips";
import { cn } from "~/lib/utils";

const TRIPS_PER_PAGE = 8;

const featuredDestinations = [
    { id: 1, name: "Hawa Mahal", search: "Rajasthan", location: "Jaipur, Rajasthan", image: "/assets/images/2.jpg" },
    { id: 2, name: "Taj Mahal", search: "Uttar Pradesh", location: "Agra, Uttar Pradesh", image: "/assets/images/card-img-2.png" },
    { id: 3, name: "Gateway of India", search: "Maharashtra", location: "Mumbai, Maharashtra", image: "/assets/images/3.jpg" },
    { id: 4, name: "Golden Temple", search: "Punjab", location: "Amritsar, Punjab", image: "/assets/images/7.jpg" },
    { id: 5, name: "Dal Lake", search: "Kashmir", location: "Srinagar, Kashmir", image: "/assets/images/10.jpg" },
    { id: 6, name: "Andaman Island", search: "Andaman", location: "Port Blair", image: "/assets/images/13.jpg" },
];

const stats = [
    { value: "12K+", label: "Happy travellers" },
    { value: "36", label: "States & UTs" },
    { value: "450+", label: "Itineraries" },
    { value: "4.9", label: "Average rating", star: true },
];

const features = [
    { Icon: Sparkles, title: "AI-powered planning", text: "Every itinerary is built day by day around your budget, style and interests." },
    { Icon: Compass, title: "Handpicked trips", text: "Curated experiences for solo travellers, couples, families and friends." },
    { Icon: Wallet, title: "Clear budgets", text: "Estimated prices upfront, so there are no surprises later." },
    { Icon: ShieldCheck, title: "Trusted local guides", text: "Verified partners in every state, from Kashmir to Kerala." },
];

type FeaturedProps = (typeof featuredDestinations)[number] & { className?: string; large?: boolean; tripCount: number };

const FeaturedCard = ({ name, search, location, image, className, large, tripCount }: FeaturedProps) => (
    <Link
        to={`/travel?q=${encodeURIComponent(search)}`}
        className={cn("relative rounded-20 overflow-hidden group min-h-65", className)}
    >
        <img
            src={image}
            alt={name}
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ objectPosition: large ? "center 30%" : "center" }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
        <span className="price-pill absolute top-3 left-3">
            {tripCount} {tripCount === 1 ? "trip" : "trips"}
        </span>
        <article className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white flex items-end justify-between gap-3">
            <span className="flex flex-col gap-1">
                <h2 className={cn("font-semibold", large ? "text-xl md:text-3xl" : "text-base md:text-xl")}>{name}</h2>
                <figure className="flex items-center gap-1.5">
                    <img src="/assets/icons/location-mark.svg" alt="" className="size-4 invert brightness-0" />
                    <figcaption className="text-xs md:text-sm text-white/90">{location}</figcaption>
                </figure>
            </span>
            <span className="size-10 shrink-0 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                <ArrowRight size={18} />
            </span>
        </article>
    </Link>
);

const TravelPage = () => {
    const trips = dummyTrips;
    const [page, setPage] = useState(1);
    const visible = trips.slice((page - 1) * TRIPS_PER_PAGE, page * TRIPS_PER_PAGE);

    const countFor = (search: string) =>
        trips.filter((t) => `${t.name} ${t.location}`.toLowerCase().includes(search.toLowerCase())).length;
    const featured = featuredDestinations.map((d) => ({ ...d, tripCount: countFor(d.search) }));

    return (
        <main className="flex flex-col">
            {/* Hero */}
            <section id="hero" className="travel-hero">
                <div>
                    <section className="wrapper">
                        <article>
                            <span className="flex items-center gap-2 w-fit bg-white/80 backdrop-blur text-primary-100 text-sm font-semibold rounded-full px-4 py-1.5 shadow-sm">
                                <MapPinned size={16} /> Explore incredible India
                            </span>
                            <h1 className="p-72-bold text-dark-100">Plan Your Trip with Ease</h1>
                            <p>
                                Customize your travel itinerary in minutes. Pick your destination,
                                set your preferences, and explore with confidence.
                            </p>
                        </article>
                        <aside className="flex flex-wrap items-center gap-3 w-full">
                            <a
                                href="#trips"
                                className="flex items-center gap-2 bg-primary-100 hover:bg-primary-500 text-white font-semibold rounded-full px-8 py-3 shadow-lg shadow-primary-100/30 transition-colors"
                            >
                                Explore trips <ArrowRight size={18} />
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
                    {stats.map(({ value, label, star }) => (
                        <li key={label} className="flex flex-col items-center text-center gap-1">
                            <strong className="flex items-center gap-1 text-2xl md:text-3xl font-bold text-primary-100">
                                {value}
                                {star && <Star size={22} className="fill-amber-400 text-amber-400" />}
                            </strong>
                            <span className="text-sm text-gray-100">{label}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Featured destinations */}
            <section id="featured" className="wrapper pt-20 flex flex-col gap-10">
                <Header title="Featured Travel Destinations" description="Discover some of the best places you can visit across India." />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:auto-rows-[260px]">
                    <FeaturedCard {...featured[0]} large className="sm:col-span-2 lg:row-span-2" />
                    <FeaturedCard {...featured[1]} />
                    <FeaturedCard {...featured[2]} />
                    <FeaturedCard {...featured[3]} />
                    <FeaturedCard {...featured[4]} />
                    <FeaturedCard {...featured[5]} />
                </div>
            </section>

            {/* Handpicked trips */}
            <section id="trips" className="wrapper pt-20 pb-16 flex flex-col gap-10">
                <span className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <Header title="Handpicked Trips" description="Browse well-planned trips designed for different travel styles and interests." />
                    <Link to="/travel" className="flex items-center gap-2 text-primary-100 font-semibold hover:gap-3 transition-all shrink-0">
                        View all trips <ArrowRight size={18} />
                    </Link>
                </span>

                <div className="trip-grid">
                    {visible.map((t) => (
                        <TripCard key={t.id} id={t.id} name={t.name} imageUrl={t.imageUrl} location={t.location} tags={t.tags} price={t.price} />
                    ))}
                </div>

                {trips.length > TRIPS_PER_PAGE && (
                    <PagerComponent
                        totalRecordsCount={trips.length}
                        pageSize={TRIPS_PER_PAGE}
                        currentPage={page}
                        click={(args: { currentPage: number }) => setPage(args.currentPage)}
                    />
                )}
            </section>

            {/* Why TravelSphere */}
            <section className="wrapper pb-20 flex flex-col gap-10">
                <Header title="Why TravelSphere" description="Everything you need to plan a trip you will remember." />
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map(({ Icon, title, text }) => (
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

            {/* Testimonials */}
            <section className="bg-white border-y border-light-400">
                <div className="wrapper py-20 flex flex-col gap-10">
                    <Header title="What Travellers Say" description="Stories from people who explored India with TravelSphere." />
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <li key={t.name} className="relative bg-light-200 rounded-3xl p-6 flex flex-col gap-5">
                                <Quote size={32} className="text-primary-100/20 absolute top-5 right-5" />
                                <span className="flex gap-0.5">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                                    ))}
                                </span>
                                <p className="text-dark-100 leading-7">"{t.quote}"</p>
                                <span className="flex items-center gap-3 mt-auto">
                                    <img src={t.image} alt={t.name} className="size-11 rounded-full object-cover" />
                                    <span className="flex flex-col leading-tight">
                                        <strong className="text-dark-100 text-sm">{t.name}</strong>
                                        <small className="text-gray-100">{t.role}</small>
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* CTA */}
            <section className="wrapper py-20">
                <article className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary-100 to-violet-600 text-white p-8 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <span className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10" />
                    <span className="absolute right-40 -bottom-20 size-48 rounded-full bg-white/10" />
                    <span className="relative flex flex-col gap-2 max-w-xl">
                        <h2 className="text-2xl md:text-4xl font-bold">Ready for your next adventure?</h2>
                        <p className="text-white/80">Ask our AI for ideas, or browse every handpicked trip.</p>
                    </span>
                    <span className="relative flex flex-wrap gap-3">
                        <button
                            onClick={() => window.dispatchEvent(new Event("open-ai-mode"))}
                            className="flex items-center gap-2 bg-white text-primary-100 font-semibold rounded-full px-7 py-3.5 hover:scale-105 transition-transform cursor-pointer"
                        >
                            <Sparkles size={18} /> Try AI mode
                        </button>
                        <Link to="/travel" className="flex items-center gap-2 border border-white/60 text-white font-semibold rounded-full px-7 py-3.5 hover:bg-white/10 transition-colors">
                            All trips <ArrowRight size={18} />
                        </Link>
                    </span>
                </article>
            </section>
        </main>
    );
};

export default TravelPage;

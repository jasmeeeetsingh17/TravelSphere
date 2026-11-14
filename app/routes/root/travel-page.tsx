import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CheckCircle2, ChevronDown, MapPinned, Star } from "lucide-react";
import { Header } from "../../../components";
import { Deals, Faq } from "../../../components/LandingSections";
import { WhyUs } from "../../../components/LandingExtras";
import { dummyTrips } from "~/constants/dummyTrips";
import { cn } from "~/lib/utils";

const featuredDestinations = [
    { id: 1, name: "Hawa Mahal", search: "Rajasthan", location: "Jaipur, Rajasthan", image: "/assets/images/2.jpg" },
    { id: 2, name: "Taj Mahal", search: "Uttar Pradesh", location: "Agra, Uttar Pradesh", image: "/assets/images/card-img-2.png" },
    { id: 3, name: "Gateway of India", search: "Maharashtra", location: "Mumbai, Maharashtra", image: "/assets/images/3.jpg" },
    { id: 4, name: "Golden Temple", search: "Punjab", location: "Amritsar, Punjab", image: "/assets/images/7.jpg" },
    { id: 5, name: "Dal Lake", search: "Kashmir", location: "Srinagar, Kashmir", image: "/assets/images/10.jpg" },
    { id: 6, name: "Andaman Island", search: "Andaman", location: "Port Blair", image: "/assets/images/13.jpg" },
];

/** Destinations that rotate in the hero headline */
const ROTATING = ["Rajasthan", "Kerala", "Ladakh", "Goa", "Kashmir", "Sikkim"];

const PERKS = ["No payment to request", "Free date changes", "24x7 local support"];

const AVATARS = ["/assets/images/david.webp", "/assets/images/james.webp", "/assets/images/michael.webp"];

const stats = [
    { value: "12K+", label: "Happy travellers" },
    { value: "36", label: "States & UTs" },
    { value: "450+", label: "Itineraries" },
    { value: "4.9", label: "Average rating", star: true },
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

    const countFor = (search: string) =>
        trips.filter((t) => `${t.name} ${t.location}`.toLowerCase().includes(search.toLowerCase())).length;
    const featured = featuredDestinations.map((d) => ({ ...d, tripCount: countFor(d.search) }));

    // Rotate the destination in the headline every 2.5 seconds
    const [wordIndex, setWordIndex] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setWordIndex((i) => (i + 1) % ROTATING.length), 2500);
        return () => clearInterval(id);
    }, []);

    return (
        <main className="flex flex-col">
            {/* Hero */}
            <section id="hero" className="relative bg-hero bg-cover bg-center">
                <div className="bg-linear100 bg-cover">
                    <div className="wrapper relative pt-32 pb-36 md:pt-40 md:pb-44 flex flex-col">
                        <div className="flex flex-col gap-6 max-w-2xl">
                            <span className="flex items-center gap-2 w-fit bg-surface/80 backdrop-blur text-primary-100 text-sm font-semibold rounded-full px-4 py-1.5 shadow-sm">
                                <MapPinned size={16} /> Explore incredible India
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold text-dark-100 leading-[1.05] tracking-tight">
                                Plan your trip to
                                <span
                                    key={ROTATING[wordIndex]}
                                    className="hero-word block pb-1 bg-linear-to-r from-primary-100 to-violet-600 bg-clip-text text-transparent"
                                >
                                    {ROTATING[wordIndex]}
                                </span>
                            </h1>
                            <p className="text-lg text-dark-400 max-w-xl">
                                Day-by-day itineraries across India, from Himalayan passes to Kerala backwaters. Pick a place, set your style and go.
                            </p>

                            {/* Trust + reassurance */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2">
                                <span className="flex items-center gap-3">
                                    <span className="flex -space-x-3">
                                        {AVATARS.map((src) => (
                                            <img key={src} src={src} alt="" className="size-10 rounded-full object-cover border-2 border-surface shadow" />
                                        ))}
                                        <span className="size-10 rounded-full border-2 border-surface bg-primary-100 text-white text-[11px] font-bold flex items-center justify-center shadow">
                                            12K+
                                        </span>
                                    </span>
                                    <span className="flex flex-col leading-tight">
                                        <span className="flex items-center gap-0.5">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                            ))}
                                            <strong className="ml-1 text-sm text-dark-100">4.9</strong>
                                        </span>
                                        <small className="text-dark-400">Loved by 12,000+ travellers</small>
                                    </span>
                                </span>
                                <span className="hidden sm:block h-10 w-px bg-dark-100/15" />
                                <ul className="flex flex-col gap-1">
                                    {PERKS.map((p) => (
                                        <li key={p} className="flex items-center gap-2 text-sm font-medium text-dark-400">
                                            <CheckCircle2 size={16} className="text-success-700 shrink-0" /> {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Scroll cue */}
                        <a
                            href="#featured"
                            className="hidden md:flex absolute bottom-20 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-xs font-semibold text-dark-400 hover:text-primary-100 transition-colors"
                        >
                            Scroll to explore
                            <ChevronDown size={20} className="animate-bounce" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats strip */}
            <section className="wrapper -mt-12 relative z-10">
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface rounded-3xl shadow-xl border border-light-400 p-6 md:p-8">
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

            <Deals />


            <WhyUs />
            <Faq />
            <div className="pb-20" />
        </main>
    );
};

export default TravelPage;

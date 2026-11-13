import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
    ArrowRight, Building2, CalendarCheck, Compass, Flame, Gem, Landmark, MapPin, MapPinned, Mountain, Palmtree, Quote, Search,
    ShieldCheck, SlidersHorizontal, Sparkles, Star, Trees, Wallet, type LucideIcon,
} from "lucide-react";
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

const POPULAR = ["Rajasthan", "Kerala", "Ladakh", "Goa", "Kashmir"];

const styles: { name: string; Icon: LucideIcon; tone: string }[] = [
    { name: "Adventure", Icon: Mountain, tone: "from-orange-400 to-rose-500" },
    { name: "Cultural", Icon: Landmark, tone: "from-amber-400 to-orange-500" },
    { name: "Relaxed", Icon: Palmtree, tone: "from-teal-400 to-cyan-500" },
    { name: "Spiritual", Icon: Flame, tone: "from-yellow-400 to-amber-500" },
    { name: "Nature & Outdoors", Icon: Trees, tone: "from-emerald-400 to-green-600" },
    { name: "Luxury", Icon: Gem, tone: "from-violet-400 to-purple-600" },
    { name: "City Exploration", Icon: Building2, tone: "from-sky-400 to-blue-600" },
];

const steps = [
    { Icon: MapPin, title: "Pick a destination", text: "Choose from all 28 states and 8 union territories of India." },
    { Icon: SlidersHorizontal, title: "Set your style", text: "Tell us your budget, group and interests: temples, beaches, food or treks." },
    { Icon: CalendarCheck, title: "Get your plan", text: "A day-by-day itinerary with timings, weather and a price in rupees." },
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
    const spotlight = trips.find((t) => t.id === "udaipur-lakes") ?? trips[0];

    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const search = (e: FormEvent) => {
        e.preventDefault();
        navigate(query.trim() ? `/travel?q=${encodeURIComponent(query.trim())}` : "/travel");
    };

    return (
        <main className="flex flex-col">
            {/* Hero */}
            <section id="hero" className="relative bg-hero bg-cover bg-center">
                <div className="bg-linear100 bg-cover">
                    <div className="wrapper pt-32 pb-36 md:pt-40 md:pb-44 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
                        <div className="flex flex-col gap-6 max-w-2xl">
                            <span className="flex items-center gap-2 w-fit bg-white/80 backdrop-blur text-primary-100 text-sm font-semibold rounded-full px-4 py-1.5 shadow-sm">
                                <MapPinned size={16} /> Explore incredible India
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold text-dark-100 leading-[1.05] tracking-tight">
                                Plan your trip <span className="block bg-linear-to-r from-primary-100 to-violet-600 bg-clip-text text-transparent">with ease</span>
                            </h1>
                            <p className="text-lg text-dark-400 max-w-xl">
                                Day-by-day itineraries across India, from Himalayan passes to Kerala backwaters. Pick a place, set your style and go.
                            </p>

                            <form onSubmit={search} className="flex items-center gap-2 bg-white rounded-full p-2 pl-5 shadow-xl shadow-dark-100/10 border border-white max-w-xl">
                                <Search size={20} className="text-gray-100 shrink-0" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Where do you want to go?"
                                    aria-label="Search destinations"
                                    className="flex-1 min-w-0 h-11 bg-transparent text-dark-100 outline-none placeholder:text-gray-100"
                                />
                                <button type="submit" className="flex items-center gap-2 bg-primary-100 hover:bg-primary-500 text-white font-semibold rounded-full px-5 sm:px-7 h-11 transition-colors cursor-pointer">
                                    <span className="hidden sm:inline">Search</span>
                                    <ArrowRight size={18} className="sm:hidden" />
                                </button>
                            </form>

                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-dark-400 font-medium mr-1">Popular:</span>
                                {POPULAR.map((p) => (
                                    <Link
                                        key={p}
                                        to={`/travel?q=${encodeURIComponent(p)}`}
                                        className="bg-white/70 hover:bg-white backdrop-blur text-dark-100 font-medium rounded-full px-3.5 py-1.5 transition-colors"
                                    >
                                        {p}
                                    </Link>
                                ))}
                                <button
                                    onClick={() => window.dispatchEvent(new Event("open-ai-mode"))}
                                    className="flex items-center gap-1.5 bg-dark-100/80 hover:bg-dark-100 text-white font-medium rounded-full px-3.5 py-1.5 transition-colors cursor-pointer"
                                >
                                    <Sparkles size={14} /> Ask AI
                                </button>
                            </div>
                        </div>

                        {/* Floating preview card */}
                        {spotlight && (
                            <div className="relative hidden lg:block">
                                <Link to={`/travel/${spotlight.id}`} className="group block bg-white rounded-3xl p-3 shadow-2xl shadow-dark-100/20 rotate-2 hover:rotate-0 transition-transform duration-500">
                                    <span className="block relative h-64 rounded-2xl overflow-hidden">
                                        <img src={spotlight.imageUrl} alt={spotlight.name} className="size-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold text-dark-100 rounded-full px-3 py-1">Trip of the week</span>
                                    </span>
                                    <span className="flex items-start justify-between gap-3 px-2 pt-4 pb-2">
                                        <span className="flex flex-col gap-1">
                                            <strong className="text-lg text-dark-100 leading-snug">{spotlight.name}</strong>
                                            <small className="flex items-center gap-1 text-gray-100"><MapPin size={14} /> {spotlight.location}</small>
                                        </span>
                                        <span className="flex flex-col items-end shrink-0">
                                            <strong className="text-lg text-primary-100">{spotlight.price}</strong>
                                            <small className="text-gray-100">{spotlight.duration}</small>
                                        </span>
                                    </span>
                                </Link>
                                <span className="absolute -left-10 top-10 flex items-center gap-2 bg-white rounded-2xl shadow-xl px-4 py-3 -rotate-3">
                                    <span className="size-9 rounded-xl bg-amber-50 flex items-center justify-center"><Star size={18} className="fill-amber-400 text-amber-400" /></span>
                                    <span className="flex flex-col leading-tight"><strong className="text-dark-100 text-sm">4.9 rating</strong><small className="text-gray-100 text-xs">12K+ travellers</small></span>
                                </span>
                                <span className="absolute -right-6 -bottom-6 flex items-center gap-2 bg-white rounded-2xl shadow-xl px-4 py-3 rotate-3">
                                    <span className="size-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-100"><Sparkles size={18} /></span>
                                    <span className="flex flex-col leading-tight"><strong className="text-dark-100 text-sm">AI itinerary</strong><small className="text-gray-100 text-xs">Ready in seconds</small></span>
                                </span>
                            </div>
                        )}
                    </div>
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

            {/* Browse by travel style */}
            <section className="wrapper pt-20 flex flex-col gap-10">
                <Header title="Travel Your Way" description="Pick a style and see trips made for it." />
                <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {styles.map(({ name, Icon, tone }) => {
                        const count = trips.filter((t) => t.style === name).length;
                        return (
                            <li key={name}>
                                <Link
                                    to={`/travel?q=${encodeURIComponent(name)}`}
                                    className="group h-full bg-white rounded-3xl border border-light-400 p-5 flex flex-col items-center text-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all"
                                >
                                    <span className={cn("size-14 rounded-2xl bg-linear-to-br text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform", tone)}>
                                        <Icon size={26} />
                                    </span>
                                    <strong className="text-sm font-semibold text-dark-100 leading-tight">{name}</strong>
                                    <small className="text-xs text-gray-100">{count} {count === 1 ? "trip" : "trips"}</small>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
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

            {/* How it works */}
            <section className="wrapper pb-20 flex flex-col gap-10">
                <Header title="How It Works" description="From idea to itinerary in three steps." />
                <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
                    <span aria-hidden className="hidden md:block absolute top-10 left-[16%] right-[16%] border-t-2 border-dashed border-primary-100/30" />
                    {steps.map(({ Icon, title, text }, i) => (
                        <li key={title} className="relative bg-white rounded-3xl border border-light-400 p-6 flex flex-col items-center text-center gap-3">
                            <span className="relative size-14 rounded-full bg-primary-100 text-white flex items-center justify-center shadow-lg shadow-primary-100/30">
                                <Icon size={24} />
                                <span className="absolute -top-1 -right-1 size-6 rounded-full bg-dark-100 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                            </span>
                            <h3 className="text-lg font-semibold text-dark-100">{title}</h3>
                            <p className="text-sm leading-6 text-gray-100">{text}</p>
                        </li>
                    ))}
                </ol>
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

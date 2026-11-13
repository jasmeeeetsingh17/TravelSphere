/** Extra sections for the public landing page. All content is sample data. */
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
    ArrowRight, BadgePercent, Building2, CalendarCheck, CheckCircle2, ChevronDown, Clock, Flame, Gem, Landmark, Loader2, Mail, MapPin, MessageCircle,
    Mountain, Palmtree, Phone, Quote, Send, SlidersHorizontal, Star, Trees, type LucideIcon,
} from "lucide-react";
import { dummyTrips, testimonials } from "~/constants/dummyTrips";
import { cn, money, priceToNumber } from "~/lib/utils";
import Header from "./Header";

/* ---------------- Travel styles ---------------- */
const STYLES: { name: string; Icon: LucideIcon; tone: string }[] = [
    { name: "Adventure", Icon: Mountain, tone: "from-orange-400 to-rose-500" },
    { name: "Cultural", Icon: Landmark, tone: "from-amber-400 to-orange-500" },
    { name: "Relaxed", Icon: Palmtree, tone: "from-teal-400 to-cyan-500" },
    { name: "Spiritual", Icon: Flame, tone: "from-yellow-400 to-amber-500" },
    { name: "Nature & Outdoors", Icon: Trees, tone: "from-emerald-400 to-green-600" },
    { name: "Luxury", Icon: Gem, tone: "from-violet-400 to-purple-600" },
    { name: "City Exploration", Icon: Building2, tone: "from-sky-400 to-blue-600" },
];

export const TravelStyles = () => (
    <section className="wrapper pt-20 flex flex-col gap-10">
        <Header title="Travel Your Way" description="Pick a style and see trips made for it." />
        <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {STYLES.map(({ name, Icon, tone }) => {
                const count = dummyTrips.filter((t) => t.style === name).length;
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
);

/* ---------------- Trending deals ---------------- */
const DEALS = [
    { id: "goa-beach-break", off: 20 },
    { id: "kerala-backwaters", off: 15 },
    { id: "himachal-hills", off: 12 },
    { id: "rishikesh-yoga-rafting", off: 10 },
];

export const Deals = () => (
    <section className="wrapper pt-20 flex flex-col gap-10">
        <span className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <Header title="Trending Deals" description="Limited-time prices on some of our most loved trips." />
            <span className="flex items-center gap-2 text-sm font-semibold text-pink-500 bg-pink-50 rounded-full px-4 py-2 w-fit shrink-0 whitespace-nowrap">
                <Clock size={16} /> Offers end soon
            </span>
        </span>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEALS.map(({ id, off }) => {
                const t = dummyTrips.find((x) => x.id === id);
                if (!t) return null;
                const price = priceToNumber(t.price);
                const deal = Math.round((price * (100 - off)) / 100 / 100) * 100;
                return (
                    <li key={id}>
                        <Link to={`/travel/${t.id}`} className="group block h-full bg-white rounded-3xl border border-light-400 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                            <span className="relative block h-44 overflow-hidden">
                                <img src={t.imageUrl} alt={t.name} className="size-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-pink-500 text-white text-xs font-bold px-3 py-1 shadow">
                                    <BadgePercent size={14} /> {off}% OFF
                                </span>
                            </span>
                            <span className="flex flex-col gap-2 p-5">
                                <strong className="text-dark-100 leading-snug line-clamp-1">{t.name}</strong>
                                <small className="flex items-center gap-1 text-gray-100"><MapPin size={14} /> {t.location} · {t.duration}</small>
                                <span className="flex items-baseline gap-2 mt-1">
                                    <strong className="text-xl text-primary-100">{money(deal)}</strong>
                                    <s className="text-sm text-gray-100">{t.price}</s>
                                </span>
                                <small className="text-xs font-semibold text-success-700">You save {money(price - deal)}</small>
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    </section>
);

/* ---------------- How it works ---------------- */
const STEPS = [
    { Icon: MapPin, title: "Pick a trip", text: "Browse handpicked itineraries across all 28 states and 8 union territories." },
    { Icon: SlidersHorizontal, title: "Send a request", text: "Choose your date and travellers. No payment and no sign-in needed." },
    { Icon: CalendarCheck, title: "We confirm", text: "Our team calls you within 24 hours to confirm and tailor the plan." },
];

export const HowItWorks = () => (
    <section className="wrapper pt-20 flex flex-col gap-10">
        <Header title="How It Works" description="From idea to confirmed trip in three steps." />
        <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            <span aria-hidden className="hidden md:block absolute top-10 left-[16%] right-[16%] border-t-2 border-dashed border-primary-100/30" />
            {STEPS.map(({ Icon, title, text }, i) => (
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
);

/* ---------------- Testimonials ---------------- */
export const Testimonials = () => (
    <section className="mt-20 bg-white border-y border-light-400">
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
);

/* ---------------- FAQ ---------------- */
const FAQS = [
    { q: "How do I book a trip?", a: "Open any trip and press \"Book this trip\". Enter your name, phone, travel date and number of travellers. Our team calls you within 24 hours to confirm. You don't need an account." },
    { q: "Do I pay when I send a booking request?", a: "No. Sending a request is free. You pay only after we call you and confirm the details. We accept UPI, debit and credit cards and net banking." },
    { q: "Are the prices per person?", a: "Each trip shows a price for its group (for example a Family trip is priced for 4 people). The booking form shows the price per person and the total for your group." },
    { q: "Can I change or cancel my booking?", a: "Yes. Call or email us and we'll change your dates or cancel. Changes are free up to 15 days before travel." },
    { q: "Can you make a custom trip for me?", a: "Of course. Tell us where you want to go, your budget and your interests, and we'll build a day-by-day plan just for you." },
];

export const Faq = () => (
    <section id="faq" className="wrapper pt-20 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
        <span className="flex flex-col gap-4 lg:sticky lg:top-28">
            <Header title="Questions? Answers." description="Everything you need to know before you book." />
            <a href="#contact" className="flex items-center gap-2 w-fit text-primary-100 font-semibold hover:gap-3 transition-all">
                Still unsure? Talk to us <ArrowRight size={18} />
            </a>
        </span>
        <ul className="flex flex-col gap-3">
            {FAQS.map((f, i) => (
                <li key={f.q}>
                    <details className="group bg-white rounded-2xl border border-light-400 open:shadow-md transition-shadow" open={i === 0}>
                        <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 font-semibold text-dark-100 [&::-webkit-details-marker]:hidden">
                            {f.q}
                            <ChevronDown size={20} className="shrink-0 text-gray-100 transition-transform group-open:rotate-180" />
                        </summary>
                        <p className="px-5 pb-5 -mt-1 text-sm leading-7 text-gray-100">{f.a}</p>
                    </details>
                </li>
            ))}
        </ul>
    </section>
);

/* ---------------- Contact + newsletter ---------------- */
export const CONTACT = {
    phone: "+91 98765 43210",
    phoneHref: "tel:+919876543210",
    whatsapp: "https://wa.me/919876543210",
    email: "hello@travelsphere.in",
    hours: "Mon to Sat, 9 AM to 8 PM",
    address: "Connaught Place, New Delhi 110001",
};

export const ContactBand = () => {
    const [email, setEmail] = useState("");
    const [company, setCompany] = useState("");
    const [state, setState] = useState<"idle" | "busy" | "done">("idle");
    const [error, setError] = useState("");

    const subscribe = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Please enter a valid email address.");
        setState("busy");
        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, company }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? "Could not subscribe.");
            setState("done");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not subscribe.");
            setState("idle");
        }
    };

    return (
        <section id="contact" className="wrapper py-20">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-dark-100 to-[#1f2a44] text-white p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <span className="absolute -right-16 -top-16 size-64 rounded-full bg-primary-100/25 blur-2xl" />
                <span className="absolute -left-10 -bottom-20 size-56 rounded-full bg-violet-600/20 blur-2xl" />

                <div className="relative flex flex-col gap-5">
                    <h2 className="text-2xl md:text-4xl font-bold leading-tight">Plan with a travel expert</h2>
                    <p className="text-white/70 max-w-md">Not sure where to go? Call or message us and we'll suggest a trip that fits your dates and budget.</p>
                    <ul className="flex flex-col gap-3">
                        <li>
                            <a href={CONTACT.phoneHref} className="flex items-center gap-3 hover:text-primary-50">
                                <span className="size-10 rounded-xl bg-white/10 flex items-center justify-center"><Phone size={18} /></span>
                                <span className="flex flex-col leading-tight"><strong>{CONTACT.phone}</strong><small className="text-white/60">{CONTACT.hours}</small></span>
                            </a>
                        </li>
                        <li>
                            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-primary-50">
                                <span className="size-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center"><MessageCircle size={18} /></span>
                                <span className="flex flex-col leading-tight"><strong>Chat on WhatsApp</strong><small className="text-white/60">Quick replies</small></span>
                            </a>
                        </li>
                        <li>
                            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 hover:text-primary-50">
                                <span className="size-10 rounded-xl bg-white/10 flex items-center justify-center"><Mail size={18} /></span>
                                <span className="flex flex-col leading-tight"><strong>{CONTACT.email}</strong><small className="text-white/60">We reply within a day</small></span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="relative flex flex-col justify-center gap-4 bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-semibold">Get travel deals in your inbox</h3>
                    <p className="text-sm text-white/70">One email a month with new trips and offers. No spam, unsubscribe any time.</p>
                    {state === "done" ? (
                        <p className="flex items-center gap-2 rounded-xl bg-emerald-500/15 text-emerald-300 px-4 py-3 text-sm font-medium">
                            <CheckCircle2 size={18} /> You're subscribed. Watch your inbox for the next deals.
                        </p>
                    ) : (
                        <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                aria-label="Email address"
                                required
                                className="flex-1 h-12 rounded-xl bg-white text-dark-100 px-4 outline-none focus:ring-2 focus:ring-primary-100"
                            />
                            <input value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="company" />
                            <button type="submit" disabled={state === "busy"} className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary-100 hover:bg-primary-500 font-semibold disabled:opacity-60 cursor-pointer">
                                {state === "busy" ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Subscribe
                            </button>
                        </form>
                    )}
                    {error && <p className="text-sm text-rose-300">{error}</p>}
                </div>
            </div>
        </section>
    );
};

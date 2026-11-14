/** Extra sections for the public landing page. All content is sample data. */
import { Link } from "react-router";
import { ArrowRight, BadgePercent, ChevronDown, Clock, MapPin } from "lucide-react";
import { dummyTrips } from "~/constants/dummyTrips";
import { money, priceToNumber } from "~/lib/utils";
import Header from "./Header";

/* ---------------- Trending deals ---------------- */
const DEALS = [
    { id: "goa-beach-break", off: 20 },
    { id: "kerala-backwaters", off: 15 },
    { id: "himachal-hills", off: 12 },
    { id: "rishikesh-yoga-rafting", off: 10 },
];

export const Deals = () => (
    <section id="deals" className="wrapper pt-20 flex flex-col gap-10 scroll-mt-16">
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
                        <Link to={`/travel/${t.id}`} className="group block h-full bg-surface rounded-3xl border border-light-400 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
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

/* ---------------- FAQ ---------------- */
const FAQS = [
    { q: "How do I book a trip?", a: "Open any trip and press \"Book this trip\". Enter your name, phone, travel date and number of travellers. Our team calls you within 24 hours to confirm. You don't need an account." },
    { q: "Do I pay when I send a booking request?", a: "No. Sending a request is free. You pay only after we call you and confirm the details. We accept UPI, debit and credit cards and net banking." },
    { q: "Are the prices per person?", a: "Each trip shows a price for its group (for example a Family trip is priced for 4 people). The booking form shows the price per person and the total for your group." },
    { q: "Can I change or cancel my booking?", a: "Yes. Call or email us and we'll change your dates or cancel. Changes are free up to 15 days before travel." },
    { q: "Can AI help me choose a trip?", a: "Yes. Open AI Suggest, answer a few quick questions about where, when, who and your budget, and our AI picks the trips that suit you best and tells you why. It's free and you don't need an account." },
    { q: "Can you make a custom trip for me?", a: "Of course. Tell us where you want to go, your budget and your interests, and we'll build a day-by-day plan just for you." },
];

export const Faq = () => (
    <section id="faq" className="wrapper pt-20 scroll-mt-16 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
        <span className="flex flex-col gap-4 lg:sticky lg:top-28">
            <Header title="Questions? Answers." description="Everything you need to know before you book." />
            <Link to="/suggest" className="flex items-center gap-2 w-fit text-primary-100 font-semibold hover:gap-3 transition-all">
                Get AI trip suggestions <ArrowRight size={18} />
            </Link>
            <a href="#contact" className="flex items-center gap-2 w-fit text-primary-100 font-semibold hover:gap-3 transition-all">
                Still unsure? Talk to us <ArrowRight size={18} />
            </a>
        </span>
        <ul className="flex flex-col gap-3">
            {FAQS.map((f, i) => (
                <li key={f.q}>
                    <details className="group bg-surface rounded-2xl border border-light-400 open:shadow-md transition-shadow" open={i === 0}>
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

/* ---------------- Contact details (used by the footer) ---------------- */
export const CONTACT = {
    phone: "+91 98765 43210",
    phoneHref: "tel:+919876543210",
    whatsapp: "https://wa.me/919876543210",
    email: "hello@travelsphere.in",
    hours: "Mon to Sat, 9 AM to 8 PM",
    address: "Connaught Place, New Delhi 110001",
};

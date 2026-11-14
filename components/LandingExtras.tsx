/** "Why TravelSphere" section for the landing page. Sample content. */
import { BadgeIndianRupee, Headset, ShieldCheck, Sparkles } from "lucide-react";
import Header from "./Header";

/* ---------------- Why TravelSphere ---------------- */
const REASONS = [
    { Icon: Sparkles, title: "AI-powered planning", text: "Every itinerary is built day by day around your budget, style and interests." },
    { Icon: BadgeIndianRupee, title: "Clear prices in rupees", text: "See the estimated cost per person upfront, with no hidden extras." },
    { Icon: ShieldCheck, title: "No payment to request", text: "Send a booking request for free. Pay only after we confirm the details." },
    { Icon: Headset, title: "Real people to help", text: "Our team calls you within 24 hours and is a WhatsApp message away on your trip." },
];

export const WhyUs = () => (
    <section className="wrapper pt-20 flex flex-col gap-10">
        <Header title="Why TravelSphere" description="Everything you need to plan a trip you will remember." />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {REASONS.map(({ Icon, title, text }) => (
                <li key={title} className="bg-surface rounded-3xl border border-light-400 p-6 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <span className="size-12 rounded-2xl bg-primary-50 text-primary-100 flex items-center justify-center">
                        <Icon size={24} />
                    </span>
                    <h3 className="text-lg font-semibold text-dark-100">{title}</h3>
                    <p className="text-sm leading-6 text-gray-100">{text}</p>
                </li>
            ))}
        </ul>
    </section>
);

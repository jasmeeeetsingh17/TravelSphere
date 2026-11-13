import { useEffect, useState } from "react";
import { CalendarDays, Sparkles, Wallet, Wand2 } from "lucide-react";
import CreateTripForm from "../../../components/CreateTripForm";

export const meta = () => [
    { title: "AI Trip Planner | TravelSphere" },
    { name: "description", content: "Tell us where and how you like to travel in India, and AI plans your trip day by day in seconds." },
];

const PERKS = [
    { Icon: Wand2, text: "Day-by-day plan with timings" },
    { Icon: Wallet, text: "Estimated price in rupees" },
    { Icon: CalendarDays, text: "Best season and weather" },
];

/** Public AI Trip Planner: visitors plan a trip with Gemini. Nothing is saved; no sign-in. */
const PlanTrip = () => {
    const [ai, setAi] = useState<boolean | null>(null);

    // Ask the server whether a Gemini key is set, to show the right badge
    useEffect(() => {
        fetch("/api/plan-trip")
            .then((r) => r.json())
            .then((d) => setAi(Boolean(d.ai)))
            .catch(() => setAi(false));
    }, []);

    return (
        <main className="flex flex-col">
            <section className="relative overflow-hidden bg-linear-to-br from-primary-50 via-white to-violet-50 border-b border-light-400">
                <span className="absolute -right-24 -top-24 size-96 rounded-full bg-primary-100/10 blur-3xl" />
                <span className="absolute -left-24 bottom-0 size-72 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="wrapper relative pt-32 pb-12 flex flex-col items-center text-center gap-5">
                    <span className="flex items-center gap-2 bg-white border border-light-400 shadow-sm rounded-full px-4 py-1.5 text-sm font-semibold text-primary-100">
                        <Sparkles size={16} />
                        {ai === null ? "AI Trip Planner" : ai ? "Powered by Google Gemini" : "AI Trip Planner"}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-dark-100 tracking-tight max-w-3xl">
                        Plan your India trip <span className="whitespace-nowrap bg-linear-to-r from-primary-100 to-violet-600 bg-clip-text text-transparent">in seconds</span>
                    </h1>
                    <p className="text-lg text-gray-100 max-w-2xl">
                        Pick a state, how long you have, who is coming and what you love. Our AI builds a day-by-day itinerary you can print, share or book with an expert.
                    </p>
                    <ul className="flex flex-wrap justify-center gap-3">
                        {PERKS.map(({ Icon, text }) => (
                            <li key={text} className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 text-sm font-medium text-dark-200 border border-light-400">
                                <Icon size={16} className="text-primary-100" /> {text}
                            </li>
                        ))}
                    </ul>
                    {ai === false && (
                        <small className="text-xs text-gray-100">AI is not connected right now, so plans are built from our trip templates.</small>
                    )}
                </div>
            </section>

            <section className="wrapper py-12">
                <CreateTripForm mode="public" basePath="/travel" />
            </section>
        </main>
    );
};

export default PlanTrip;

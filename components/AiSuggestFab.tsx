import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";

/** Round "AI Suggest" button in the bottom-right corner, with a slowly turning colour ring. */
const AiSuggestFab = () => {
    // Say hello once, a moment after the page loads, then tuck the bubble away
    const [hello, setHello] = useState(false);
    useEffect(() => {
        const show = setTimeout(() => setHello(true), 1500);
        const hide = setTimeout(() => setHello(false), 6500);
        return () => {
            clearTimeout(show);
            clearTimeout(hide);
        };
    }, []);

    return (
        <Link to="/suggest" aria-label="AI Suggest: find your perfect trip" className="group fixed bottom-5 right-5 z-40 flex items-center gap-3">
            <span
                className={cn(
                    "relative hidden sm:block rounded-2xl rounded-br-sm bg-white border border-light-400 shadow-lg px-4 py-2.5 text-sm text-dark-100 transition-all duration-300 origin-bottom-right",
                    "group-hover:opacity-100 group-hover:scale-100",
                    hello ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                )}
            >
                <strong className="block font-semibold leading-tight">Not sure where to go?</strong>
                <small className="text-xs text-gray-100">Ask AI for a suggestion</small>
            </span>

            <span className="relative size-14 shrink-0 rounded-full shadow-xl shadow-violet-500/30 transition-transform group-hover:scale-110">
                <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#256ff1,#8b5cf6,#ec4899,#f59e0b,#256ff1)] animate-spin [animation-duration:5s] motion-reduce:animate-none" />
                <span className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
                    <Sparkles size={22} className="text-violet-600 transition-transform duration-500 group-hover:rotate-12" />
                </span>
            </span>
        </Link>
    );
};

export default AiSuggestFab;

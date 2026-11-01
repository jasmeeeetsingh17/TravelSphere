import { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, Send, Sparkles } from "lucide-react";
import { allTrips } from "~/constants";
import { cn } from "~/lib/utils";

type Message = { id: number; role: "user" | "ai"; text: string };

const SUGGESTIONS = [
    "Trips under $2,000",
    "Romantic getaway ideas",
    "Best trips for solo travel",
    "Adventure destinations",
];

const GREETING: Message = {
    id: 0,
    role: "ai",
    text: "Hi! I'm TravelSphere AI. Tell me your budget, travel style or dream destination and I'll suggest trips.",
};

const STYLE_WORDS: Record<string, string> = {
    romantic: "couple",
    couple: "couple",
    honeymoon: "couple",
    solo: "solo",
    alone: "solo",
    family: "family",
    kids: "family",
    friends: "friends",
};

const toNumber = (price: string) => Number(price.replace(/[^0-9.]/g, "")) || 0;

/**
 * Local, rule-based replies so the UI works without a backend.
 * TODO: replace with a call to your own API route (e.g. Gemini / OpenAI)
 * that receives `input` and returns the model's answer.
 */
function getReply(input: string): string {
    const q = input.toLowerCase();
    let trips = [...allTrips];

    const budget = q.match(/(?:under|below|less than|within)\s*\$?\s*([\d,]+)/);
    if (budget) {
        const max = Number(budget[1].replace(/,/g, ""));
        trips = trips.filter((t) => toNumber(t.estimatedPrice) <= max);
    }

    const style = Object.keys(STYLE_WORDS).find((w) => q.includes(w));
    if (style) {
        trips = trips.filter((t) => t.travelStyle.toLowerCase() === STYLE_WORDS[style]);
    }

    const words = q.split(/[^a-z']+/).filter((w) => w.length > 3);
    const keywordHits = allTrips.filter((t) =>
        words.some((w) =>
            [t.name, t.itinerary?.[0]?.location ?? "", ...t.tags].join(" ").toLowerCase().includes(w)
        )
    );
    if (!budget && !style && keywordHits.length) trips = keywordHits;

    if (!trips.length) {
        return "I couldn't find an exact match. Try a different budget, or a style like solo, family or couple.";
    }

    const list = trips
        .slice(0, 3)
        .map((t) => `• ${t.name} (${t.itinerary?.[0]?.location}) `)
        .join("\n");
    return `Here are some trips you might like:\n${list}\n\nScroll to Handpicked Trips to see them all.`;
}

const AiAssistant = () => {
    const [open, setOpen] = useState(false);
    const [typing, setTyping] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([GREETING]);
    const listRef = useRef<HTMLDivElement>(null);
    const nextId = useRef(1);

    // Let any button on the page open the panel: window.dispatchEvent(new Event("open-ai-mode"))
    useEffect(() => {
        const openPanel = () => setOpen(true);
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("open-ai-mode", openPanel);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("open-ai-mode", openPanel);
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    // Keep the newest message in view
    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, typing, open]);

    const send = (text: string) => {
        const value = text.trim();
        if (!value || typing) return;
        setMessages((m) => [...m, { id: nextId.current++, role: "user", text: value }]);
        setInput("");
        setTyping(true);
        setTimeout(() => {
            setMessages((m) => [...m, { id: nextId.current++, role: "ai", text: getReply(value) }]);
            setTyping(false);
        }, 700);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
            {/* Popup panel: slides up when opened, slides down when closed */}
            <section
                role="dialog"
                aria-label="AI mode"
                inert={!open}
                className={cn(
                    "w-[calc(100vw-2.5rem)] sm:w-[390px] h-[min(540px,calc(100vh-7rem))] bg-white rounded-3xl",
                    "shadow-2xl border border-light-400 flex flex-col overflow-hidden origin-bottom-right",
                    "transition-all duration-300 ease-out",
                    open ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95 pointer-events-none"
                )}
            >
                <header className="flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-primary-100 to-violet-600 text-white">
                    <span className="flex items-center gap-2.5">
                        <span className="size-9 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot size={20} />
                        </span>
                        <span className="flex flex-col leading-tight">
                            <strong className="text-base">AI mode</strong>
                            <small className="text-xs text-white/80">Your travel planning assistant</small>
                        </span>
                    </span>
                    <button
                        onClick={() => setOpen(false)}
                        aria-label="Minimize AI mode"
                        className="size-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <ChevronDown size={22} />
                    </button>
                </header>

                <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-light-200">
                    {messages.map((m) => (
                        <p
                            key={m.id}
                            className={cn(
                                "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-6 whitespace-pre-line",
                                m.role === "user"
                                    ? "self-end bg-primary-100 text-white rounded-br-md"
                                    : "self-start bg-white border border-light-400 text-dark-100 rounded-bl-md"
                            )}
                        >
                            {m.text}
                        </p>
                    ))}

                    {typing && (
                        <p className="self-start bg-white border border-light-400 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1" aria-label="AI is typing">
                            {[0, 150, 300].map((d) => (
                                <span key={d} className="size-1.5 rounded-full bg-gray-100 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                            ))}
                        </p>
                    )}

                    {messages.length === 1 && (
                        <ul className="flex flex-wrap gap-2 pt-1">
                            {SUGGESTIONS.map((s) => (
                                <li key={s}>
                                    <button
                                        onClick={() => send(s)}
                                        className="text-xs font-medium text-primary-100 bg-primary-50 hover:bg-primary-100 hover:text-white rounded-full px-3 py-1.5 transition-colors cursor-pointer"
                                    >
                                        {s}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        send(input);
                    }}
                    className="flex items-center gap-2 p-3 border-t border-light-400 bg-white"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about trips, budgets, styles..."
                        className="flex-1 h-11 rounded-full bg-light-300 px-4 text-sm outline-none focus:ring-2 focus:ring-primary-100/40"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || typing}
                        aria-label="Send"
                        className="size-11 rounded-full bg-primary-100 text-white flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-primary-500 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </section>

            {/* Launcher */}
            <button
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-gradient-to-r from-primary-100 to-violet-600 text-white font-semibold shadow-xl hover:scale-105 transition-transform cursor-pointer"
            >
                {open ? <ChevronDown size={22} /> : <Sparkles size={22} />}
                <span>{open ? "Close" : "AI mode"}</span>
            </button>
        </div>
    );
};

export default AiAssistant;
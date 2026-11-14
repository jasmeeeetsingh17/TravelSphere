import { Link } from "react-router";
import { ArrowUp, Clock, Heart, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "./LandingSections";

/* Simple brand marks (lucide-react no longer ships brand icons) */
const Instagram = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-[18px]" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
);
const Facebook = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden>
        <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z" />
    </svg>
);
const YouTube = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden>
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
    </svg>
);
const XLogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-[16px]" aria-hidden>
        <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" />
    </svg>
);

const SOCIALS = [
    { label: "Instagram", href: "https://www.instagram.com/", Icon: Instagram },
    { label: "Facebook", href: "https://www.facebook.com/", Icon: Facebook },
    { label: "YouTube", href: "https://www.youtube.com/", Icon: YouTube },
    { label: "X", href: "https://x.com/", Icon: XLogo },
];

const COLUMNS = [
    {
        title: "Explore",
        links: [
            { label: "Home", to: "/" },
            { label: "All trips", to: "/travel" },
            { label: "AI Suggest", to: "/suggest" },
            { label: "Featured destinations", to: "/#featured" },
        ],
    },
    {
        title: "Top destinations",
        links: [
            { label: "Rajasthan", to: "/travel?q=Rajasthan" },
            { label: "Kerala", to: "/travel?q=Kerala" },
            { label: "Ladakh", to: "/travel?q=Ladakh" },
            { label: "Goa", to: "/travel?q=Goa" },
            { label: "Kashmir", to: "/travel?q=Kashmir" },
        ],
    },
    {
        title: "Help",
        links: [
            { label: "FAQ", to: "/#faq" },
            { label: "Contact us", to: "/#contact" },
            { label: "Admin login", to: "/sign-in" },
        ],
    },
];

const SiteFooter = () => (
    <footer className="bg-ink text-white">
        <div className="wrapper pt-16 pb-8 flex flex-col gap-12">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.4fr] gap-10">
                {/* Brand */}
                <div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col gap-5">
                    <Link to="/" className="flex items-center gap-2 w-fit">
                        <img src="/assets/icons/logo.svg" alt="" className="size-9" />
                        <span className="text-2xl font-bold tracking-tight">TravelSphere</span>
                    </Link>
                    <p className="text-sm leading-7 text-gray-400 max-w-xs">
                        Handpicked, day-by-day trips across India. From Himalayan passes to Kerala backwaters, planned for the way you travel.
                    </p>
                    <div className="flex items-center gap-2.5">
                        {SOCIALS.map(({ label, href, Icon }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={label}
                                className="size-10 rounded-full bg-white/10 hover:bg-primary-100 flex items-center justify-center transition-colors"
                            >
                                <Icon />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Link columns */}
                {COLUMNS.map((col) => (
                    <nav key={col.title} className="flex flex-col gap-4" aria-label={col.title}>
                        <h3 className="font-semibold">{col.title}</h3>
                        <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
                            {col.links.map((l) => (
                                <li key={l.label}>
                                    <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}

                {/* Contact */}
                <div id="contact" className="col-span-2 md:col-span-1 flex flex-col gap-4 scroll-mt-24">
                    <h3 className="font-semibold">Get in touch</h3>
                    <ul className="flex flex-col gap-3 text-sm text-gray-400">
                        <li>
                            <a href={CONTACT.phoneHref} className="flex items-center gap-3 hover:text-white transition-colors"><Phone size={16} className="shrink-0" /> {CONTACT.phone}</a>
                        </li>
                        <li>
                            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 hover:text-white transition-colors"><Mail size={16} className="shrink-0" /> {CONTACT.email}</a>
                        </li>
                        <li className="flex items-start gap-3"><MapPin size={16} className="shrink-0 mt-0.5" /> {CONTACT.address}</li>
                        <li className="flex items-center gap-3"><Clock size={16} className="shrink-0" /> {CONTACT.hours}</li>
                    </ul>
                </div>
            </div>

            {/* Payment + trust */}
            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
                <small className="text-xs text-gray-400 mr-1">We accept</small>
                {["UPI", "RuPay", "Visa", "Mastercard", "Net banking"].map((p) => (
                    <span key={p} className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-300">{p}</span>
                ))}
                <span className="ml-auto text-xs text-gray-400">No payment needed to send a booking request</span>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                <p>© {new Date().getFullYear()} TravelSphere. All rights reserved.</p>
                <p className="flex items-center gap-1.5">
                    Made with <Heart size={14} className="fill-rose-500 text-rose-500" /> in India
                </p>
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
                >
                    Back to top <ArrowUp size={16} />
                </button>
            </div>
        </div>
    </footer>
);

export default SiteFooter;

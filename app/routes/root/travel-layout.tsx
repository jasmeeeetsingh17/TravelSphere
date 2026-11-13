import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { LayoutDashboard, Menu, Sparkles, X } from "lucide-react";

import { cn } from "~/lib/utils";
import SiteFooter from "../../../components/SiteFooter";

const navLinks = [
    { label: "Home", href: "/#hero" },
    { label: "Destinations", href: "/#featured" },
    { label: "Deals", href: "/#deals" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/#contact" },
    { label: "AI Planner", href: "/plan", ai: true },
];

const TravelLayout = () => {
    const { pathname, hash } = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // Close the mobile menu whenever the page or section changes
    useEffect(() => setMenuOpen(false), [pathname, hash]);

    useEffect(() => {
        document.documentElement.style.scrollBehavior = "smooth";
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            document.documentElement.style.scrollBehavior = "";
        };
    }, []);


    return (
        <div className="bg-light-200 min-h-screen">

            {/* Header */}
            <header
                className={cn(
                    "fixed top-0 left-0 w-full z-30 transition-all duration-300",
                    menuOpen ? "bg-white shadow-md" : scrolled || pathname !== "/" ? "bg-white/85 backdrop-blur-md shadow-sm" : "bg-transparent"
                )}
            >
                <div className="wrapper">
                    <nav className="flex items-center justify-between gap-4 h-18">
                        <Link to="/" className="flex items-center gap-1.5">
                            <img src="/assets/icons/logo.svg" alt="logo" className="size-7.5" />
                            <span className="text-base md:text-2xl font-bold text-dark-100">TravelSphere</span>
                        </Link>

                        <ul className="hidden lg:flex items-center gap-5 xl:gap-7">
                            {navLinks.map((l) => (
                                <li key={l.label}>
                                    {l.href.includes("#") ? (
                                        <a href={l.href} className="text-sm font-medium text-dark-100 hover:text-primary-100 transition-colors">
                                            {l.label}
                                        </a>
                                    ) : "ai" in l ? (
                                        <Link
                                            to={l.href}
                                            className={cn(
                                                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all",
                                                pathname === l.href
                                                    ? "bg-linear-to-r from-primary-100 to-violet-600 text-white shadow-md"
                                                    : "bg-linear-to-r from-primary-50 to-violet-50 text-primary-100 hover:shadow-md"
                                            )}
                                        >
                                            <Sparkles size={15} /> {l.label}
                                        </Link>
                                    ) : (
                                        <Link to={l.href} className="text-sm font-medium text-dark-100 hover:text-primary-100 transition-colors">
                                            {l.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 bg-primary-100 hover:bg-primary-500 text-white text-sm font-semibold rounded-full px-4 sm:px-5 py-2.5 shadow-md shadow-primary-100/30 transition-colors"
                            >
                                <LayoutDashboard size={16} />
                                <span className="hidden sm:inline">Admin</span>
                            </Link>

                            <button
                                onClick={() => setMenuOpen((o) => !o)}
                                aria-label={menuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={menuOpen}
                                className="lg:hidden size-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-dark-100 cursor-pointer"
                            >
                                {menuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </nav>

                    {/* Mobile menu */}
                    <ul
                        className={cn(
                            "lg:hidden flex flex-col overflow-hidden transition-all duration-300",
                            menuOpen ? "max-h-[32rem] pb-4 opacity-100" : "max-h-0 opacity-0"
                        )}
                    >
                        {navLinks.map((l) => (
                            <li key={l.label}>
                                <Link
                                    to={l.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="block rounded-xl px-3 py-3 text-base font-medium text-dark-100 hover:bg-primary-50 hover:text-primary-100"
                                >
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </header>

            {/* Page Content */}
            <Outlet />

            {/* AI mode popup (slides up / down) */}

            <SiteFooter />
        </div>
    );
};

export default TravelLayout;
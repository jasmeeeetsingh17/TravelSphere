import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { cn } from "~/lib/utils";
import NavItems from "./NavItems";

/** Top bar with a slide-in drawer, used below the lg breakpoint. */
const MobileSidebar = () => {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => setOpen(false), [pathname]);

    return (
        <div className="lg:hidden sticky top-0 z-40">
            <header className="flex items-center justify-between bg-white/90 backdrop-blur border-b border-light-400 px-4 h-16">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <img src="/assets/icons/logo.svg" alt="" className="size-7" />
                    <span className="text-lg font-bold text-dark-100">TravelSphere</span>
                </Link>
                <button
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                    className="size-10 rounded-xl flex items-center justify-center text-dark-100 hover:bg-light-300 cursor-pointer"
                >
                    <Menu size={22} />
                </button>
            </header>

            <div
                onClick={() => setOpen(false)}
                className={cn("fixed inset-0 bg-dark-100/40 transition-opacity", open ? "opacity-100" : "opacity-0 pointer-events-none")}
            />
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl transition-transform duration-300",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <button
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="absolute top-6 right-4 z-10 size-9 rounded-lg flex items-center justify-center text-gray-100 hover:bg-light-300 cursor-pointer"
                >
                    <X size={20} />
                </button>
                <NavItems handleClick={() => setOpen(false)} />
            </aside>
        </div>
    );
};

export default MobileSidebar;

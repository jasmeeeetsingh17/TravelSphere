import { Link, NavLink, useNavigate, useRouteLoaderData } from "react-router";
import { BarChart3, CalendarCheck, ExternalLink, LayoutDashboard, LogOut, Map, PlusCircle, UserCircle, Users, type LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { logoutUser } from "~/appwrite/auth";

type NavLinkItem = { href: string; label: string; Icon: LucideIcon; end?: boolean };

const sections: { title: string; links: NavLinkItem[] }[] = [
    {
        title: "Overview",
        links: [
            { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
            { href: "/analytics", label: "Analytics", Icon: BarChart3 },
        ],
    },
    {
        title: "Manage",
        links: [
            { href: "/bookings", label: "Bookings", Icon: CalendarCheck },
            { href: "/trips", label: "All Trips", Icon: Map, end: true },
            { href: "/trips/create", label: "Create Trip", Icon: PlusCircle },
            { href: "/all-users", label: "Users", Icon: Users },
        ],
    },
    {
        title: "You",
        links: [{ href: "/account", label: "My Account", Icon: UserCircle }],
    },
];

type AdminUser = { name?: string; email?: string; imageUrl?: string } | undefined;

const NavItems = ({ handleClick }: { handleClick?: () => void }) => {
    const user = useRouteLoaderData("routes/admin/admin-layout") as AdminUser;
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUser();
        navigate("/sign-in");
    };

    return (
        <section className="flex flex-col h-full bg-white border-r border-light-400 px-5">
            <Link to="/dashboard" onClick={handleClick} className="flex items-center gap-2 py-7 border-b border-light-400">
                <img src="/assets/icons/logo.svg" alt="" className="size-8" />
                <span className="flex flex-col leading-tight">
                    <strong className="text-xl font-bold text-dark-100">TravelSphere</strong>
                    <small className="text-xs font-medium text-primary-100">Admin panel</small>
                </span>
            </Link>

            <nav className="flex-1 flex flex-col gap-6 pt-6 overflow-y-auto">
                {sections.map((section) => (
                    <div key={section.title} className="flex flex-col gap-1.5">
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-100">{section.title}</p>
                        {section.links.map(({ href, label, Icon, end }) => (
                            <NavLink
                                key={href}
                                to={href}
                                end={end}
                                onClick={handleClick}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary-100 text-white shadow-md shadow-primary-100/25"
                                            : "text-dark-200 hover:bg-primary-50 hover:text-primary-100"
                                    )
                                }
                            >
                                <Icon size={19} />
                                {label}
                            </NavLink>
                        ))}
                    </div>
                ))}

                <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark-200 hover:bg-primary-50 hover:text-primary-100 transition-colors"
                >
                    <ExternalLink size={19} />
                    View website
                </a>
            </nav>

            <footer className="flex items-center gap-3 py-5 border-t border-light-400">
                <Link to="/account" onClick={handleClick} title="My account" className="flex flex-1 min-w-0 items-center gap-3 rounded-xl hover:bg-light-200 -m-1.5 p-1.5 transition-colors">
                <img
                    src={user?.imageUrl || "/assets/images/david.webp"}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-10 rounded-full object-cover ring-2 ring-primary-50"
                />
                <span className="flex-1 min-w-0 flex flex-col leading-tight">
                    <strong className="text-sm font-semibold text-dark-100 truncate">{user?.name ?? "Admin"}</strong>
                    <small className="text-xs text-gray-100 truncate">{user?.email}</small>
                </span>
                </Link>
                <button
                    onClick={handleLogout}
                    aria-label="Log out"
                    title="Log out"
                    className="size-9 rounded-lg flex items-center justify-center text-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                >
                    <LogOut size={18} />
                </button>
            </footer>
        </section>
    );
};

export default NavItems;

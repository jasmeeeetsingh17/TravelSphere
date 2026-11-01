import { Link, Outlet, useLoaderData, useNavigate } from "react-router";
import { Mail, MapPin, Plane, Compass, ArrowUp } from "lucide-react";
import {
    Camera,
    Users,
    Play,
} from "lucide-react";



import { getUser, logoutUser } from "~/appwrite/auth";

export const clientLoader = async () => {
    try {
        return await getUser();
    } catch {
        return null;
    }
};

const TravelLayout = () => {
    const user = useLoaderData() as User | null;
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUser();
        navigate("/sign-in");
    };
    return (
        <div className="bg-light-200 min-h-screen">

            {/* Header */}
            <header className="absolute top-0 left-0 w-full z-20">
                <div className="wrapper">
                    <nav className="root-nav">
                        <Link to="/">
                            <img
                                src="/assets/icons/logo.svg"
                                alt="logo"
                                className="size-7.5"
                            />
                            <h1>TravelSphere</h1>
                        </Link>

                        <aside>
                            {user ? (
                                <>
                                    <img
                                        src={user.imageUrl || "/assets/images/david.webp"}
                                        alt={user.name}
                                        referrerPolicy="no-referrer"
                                    />

                                    <button
                                        onClick={handleLogout}
                                        className="cursor-pointer"
                                        aria-label="Log out"
                                    >
                                        <img
                                            src="/assets/icons/logout.svg"
                                            alt="logout"
                                            className="size-6 rounded-none"
                                        />
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/sign-in"
                                    className="bg-primary-100 text-white text-sm md:text-base font-semibold rounded-lg px-4 py-2.5"
                                >
                                    Sign in
                                </Link>
                            )}
                        </aside>
                    </nav>
                </div>
            </header>

            {/* Page Content */}
            <Outlet />

            {/* Footer */}
            <footer className="bg-dark-300 text-white">

                <div className="wrapper py-14 md:py-16">

                    {/* Footer Main Content */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

                        {/* Brand Section */}
                        <div className="flex flex-col gap-5">

                            <Link to="/" className="flex items-center gap-2">
                                <img
                                    src="/assets/icons/logo.svg"
                                    alt="TravelSphere"
                                    className="size-9"
                                />

                                <span className="text-2xl font-bold tracking-tight">
                                    TravelSphere
                                </span>
                            </Link>

                            <p className="text-sm leading-7 text-gray-400 max-w-xs">
                                Discover beautiful destinations, plan unforgettable
                                journeys, and explore the world with TravelSphere.
                                Your next adventure starts here.
                            </p>

                            {/* Social Links */}
                            <div className="flex items-center gap-3">

                                <a
                                    href="https://www.instagram.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Instagram"
                                    className="size-10 rounded-full bg-white/10 hover:bg-primary-100 flex items-center justify-center transition-colors"
                                >
                                    <Camera size={19} />
                                </a>

                                <a
                                    href="https://www.facebook.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Facebook"
                                    className="size-10 rounded-full bg-white/10 hover:bg-primary-100 flex items-center justify-center transition-colors"
                                >
                                    <Users size={20} />                                </a>

                                <a
                                    href="https://www.youtube.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="YouTube"
                                    className="size-10 rounded-full bg-white/10 hover:bg-primary-100 flex items-center justify-center transition-colors"
                                >
                                    <Play size={20} />                                </a>
                            </div>
                        </div>

                        {/* Explore Links */}
                        <div className="flex flex-col gap-5">

                            <h3 className="font-semibold text-lg">
                                Explore
                            </h3>

                            <div className="flex flex-col gap-3 text-sm text-gray-400">

                                <Link
                                    to="/"
                                    className="hover:text-white transition-colors"
                                >
                                    Home
                                </Link>

                                <Link
                                    to="/#featured"
                                    className="hover:text-white transition-colors"
                                >
                                    Featured Destinations
                                </Link>

                                <Link
                                    to="/#trips"
                                    className="hover:text-white transition-colors"
                                >
                                    Explore Trips
                                </Link>

                                <Link
                                    to="/travel"
                                    className="hover:text-white transition-colors"
                                >
                                    All Destinations
                                </Link>
                            </div>
                        </div>

                        {/* Travel Styles */}
                        <div className="flex flex-col gap-5">

                            <h3 className="font-semibold text-lg">
                                Travel Styles
                            </h3>

                            <div className="flex flex-col gap-3 text-sm text-gray-400">

                                <Link to="/travel" className="hover:text-white transition-colors">
                                    Adventure Trips
                                </Link>

                                <Link to="/travel" className="hover:text-white transition-colors">
                                    Family Vacations
                                </Link>

                                <Link to="/travel" className="hover:text-white transition-colors">
                                    Romantic Getaways
                                </Link>

                                <Link to="/travel" className="hover:text-white transition-colors">
                                    Solo Travel
                                </Link>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="flex flex-col gap-5">

                            <h3 className="font-semibold text-lg">
                                Get in Touch
                            </h3>

                            <div className="flex flex-col gap-4 text-sm text-gray-400">

                                <a
                                    href="mailto:hello@travelsphere.com"
                                    className="flex items-center gap-3 hover:text-white transition-colors"
                                >
                                    <Mail size={17} />
                                    hello@travelsphere.com
                                </a>

                                <div className="flex items-center gap-3">
                                    <MapPin size={17} />
                                    <span>India</span>
                                </div>

                                <Link
                                    to="/sign-in"
                                    className="flex items-center gap-3 hover:text-white transition-colors"
                                >
                                    <Plane size={17} />
                                    Start Your Journey
                                </Link>

                                <Link
                                    to="/travel"
                                    className="flex items-center gap-3 hover:text-white transition-colors"
                                >
                                    <Compass size={17} />
                                    Discover Destinations
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Footer */}
                    <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">

                        <p className="text-sm text-gray-400 text-center">
                            © {new Date().getFullYear()} TravelSphere. All rights reserved.
                        </p>

                        <p className="text-sm text-gray-400">
                            Made for travelers, by travelers.
                        </p>

                        <Link
                            to="/"
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Back to top
                            <ArrowUp size={16} />
                        </Link>

                    </div>

                </div>
            </footer>
        </div>
    );
};

export default TravelLayout;

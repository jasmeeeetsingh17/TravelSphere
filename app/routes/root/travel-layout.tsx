import { Link, Outlet, useLoaderData, useNavigate } from "react-router";
import { footers } from "~/constants";
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
            <header className="absolute top-0 left-0 w-full z-20">
                <div className="wrapper">
                    <nav className="root-nav">
                        <Link to="/">
                            <img src="/assets/icons/logo.svg" alt="logo" className="size-7.5" />
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
                                            className="size-6 !rounded-none"
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

            <Outlet />

            <footer className="bg-white border-t border-light-100">
                <div className="wrapper">
                    <div className="footer-container">
                        <Link to="/">
                            <img src="/assets/icons/logo.svg" alt="logo" className="size-7.5" />
                            <h1>TravelSphere</h1>
                        </Link>
                        <div>
                            {footers.map((item) => (
                                <Link to="/" key={item}>{item}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TravelLayout;
import { Link } from "react-router";
import { Compass } from "lucide-react";

export const meta = () => [{ title: "Page not found | TravelSphere" }];

const NotFound = () => (
    <main className="wrapper pt-40 pb-32 flex flex-col items-center gap-5 text-center">
        <span className="size-16 rounded-2xl bg-primary-50 text-primary-100 flex items-center justify-center">
            <Compass size={32} />
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-dark-100">Page not found</h1>
        <p className="text-gray-100 max-w-md">This page does not exist or was moved. Let's get you back to exploring trips.</p>
        <Link to="/" className="bg-primary-100 hover:bg-primary-500 text-white font-semibold rounded-full px-8 py-3 transition-colors">
            Back to home
        </Link>
    </main>
);

export default NotFound;

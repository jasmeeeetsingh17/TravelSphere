import { useState } from "react";
import { Link, redirect, useSearchParams } from "react-router";
import { ArrowLeft, BarChart3, Loader2, Map, ShieldCheck, Users } from "lucide-react";
import { getUser, isAdmin, loginWithGoogle } from "~/appwrite/auth";

/** Admins who are already signed in go straight to the dashboard. */
export const meta = () => [{ title: "Admin sign in | TravelSphere" }];

export async function clientLoader() {
    const user = await getUser();
    if (user && isAdmin(user)) return redirect("/dashboard");
    return null;
}

const ERRORS: Record<string, string> = {
    oauth: "Google sign-in did not complete. Please try again.",
    "not-admin": "This Google account does not have admin access. Ask an existing admin to give you access.",
};

const perks = [
    { Icon: BarChart3, text: "Live dashboard and analytics" },
    { Icon: Map, text: "Create AI-generated itineraries" },
    { Icon: Users, text: "Manage admins and team access" },
];

const SignIn = () => {
    const [params] = useSearchParams();
    const error = ERRORS[params.get("error") ?? ""];
    const [loading, setLoading] = useState(false);

    return (
        <main className="min-h-screen grid lg:grid-cols-2 bg-white">
            {/* Visual side */}
            <section className="relative hidden lg:flex flex-col justify-end p-12 text-white overflow-hidden">
                <img src="/assets/images/auth-img.webp" alt="" className="absolute inset-0 size-full object-cover" />
                <span className="absolute inset-0 bg-linear-to-t from-dark-100/90 via-dark-100/30 to-primary-100/20" />
                <div className="relative flex flex-col gap-6 max-w-md">
                    <h2 className="text-4xl font-bold leading-tight">Run TravelSphere from one place.</h2>
                    <ul className="flex flex-col gap-3">
                        {perks.map(({ Icon, text }) => (
                            <li key={text} className="flex items-center gap-3 text-white/90">
                                <span className="size-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                                    <Icon size={18} />
                                </span>
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Form side */}
            <section className="flex items-center justify-center px-6 py-16 bg-light-200">
                <div className="w-full max-w-md bg-white rounded-3xl border border-light-400 shadow-xl shadow-dark-100/5 p-8 md:p-10 flex flex-col gap-7">
                    <Link to="/" className="flex items-center gap-2 w-fit">
                        <img src="/assets/icons/logo.svg" alt="" className="size-8" />
                        <span className="text-2xl font-bold text-dark-100">TravelSphere</span>
                    </Link>

                    <header className="flex flex-col gap-2">
                        <span className="flex items-center gap-1.5 w-fit bg-primary-50 text-primary-100 text-xs font-semibold rounded-full px-3 py-1">
                            <ShieldCheck size={14} /> Admin access only
                        </span>
                        <h1 className="text-3xl font-bold text-dark-100">Welcome back</h1>
                        <p className="text-gray-100 leading-7">Sign in with your admin Google account to open the dashboard.</p>
                    </header>

                    {error && (
                        <p role="alert" className="rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm">
                            {error}
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                            setLoading(true);
                            loginWithGoogle();
                        }}
                        className="flex items-center justify-center gap-3 h-12 rounded-xl bg-primary-100 hover:bg-primary-500 text-white font-semibold shadow-lg shadow-primary-100/30 transition-colors cursor-pointer disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <img src="/assets/icons/google.svg" className="size-5" alt="" />
                        )}
                        {loading ? "Redirecting to Google..." : "Sign in with Google"}
                    </button>

                    <Link to="/" className="flex items-center justify-center gap-2 text-sm font-medium text-gray-100 hover:text-primary-100 transition-colors">
                        <ArrowLeft size={16} /> Back to the website
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default SignIn;

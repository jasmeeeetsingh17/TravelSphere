import { Link, redirect, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { loginWithGoogle } from "~/appwrite/auth";
import { account } from "~/appwrite/client";

export async function clientLoader() {
    try {
        const user = await account.get();

        if (user.$id) return redirect('/');
    } catch (e) {
        console.log('Error fetching user', e)
    }
}

const SignIn = () => {
    const [params] = useSearchParams();
    const failed = params.get("error") === "oauth";
    return (
        <main className="auth">
            <section className="size-full glassmorphism flex-center px-6">
                <div className="sign-in-card">
                    <header className="header">
                        <Link to="/">
                            <img
                                src="/assets/icons/logo.svg"
                                alt="logo"
                                className="size-7.5"
                            />
                        </Link>
                        <h1 className="p-28-bold text-dark-100">TravelSphere</h1>
                    </header>

                    <article>
                        <h2 className="p-28-semibold text-dark-100 text-center">Start Your Travel Journey</h2>

                        <p className="p-18-regular text-center text-gray-100 leading-7">Sign in with Google to plan AI itineraries, book trips and keep track of your bookings.</p>
                    </article>

                    {failed && (
                        <p role="alert" className="w-full rounded-xl bg-red-50 text-red-500 px-4 py-3 text-sm text-center">
                            Google sign-in did not complete. Please try again.
                        </p>
                    )}

                    <ButtonComponent
                        type="button"
                        iconCss="e-search-icon"
                        className="button-class h-11 w-full"
                        onClick={loginWithGoogle}
                    >
                        <img
                            src="/assets/icons/google.svg"
                            className="size-5"
                            alt="google"
                        />
                        <span className="p-18-semibold text-white">Sign in with Google</span>
                    </ButtonComponent>

                    <Link to="/" className="flex items-center justify-center gap-2 text-sm font-medium text-gray-100 hover:text-primary-100 transition-colors">
                        <ArrowLeft size={16} /> Back to home
                    </Link>
                </div>
            </section>
        </main>
    )
}
export default SignIn
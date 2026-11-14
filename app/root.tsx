import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import Spinner from "../components/Spinner";
import { isAdminPath } from "../components/Skeleton";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: Route.MetaFunction = () => [
  { title: "TravelSphere | Plan smarter. Travel further." },
  { name: "description", content: "Discover handpicked trips across India and build a day-by-day itinerary with AI." },
];

import { registerLicense } from "@syncfusion/ej2-base";
registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY);

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <script src="/theme.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/icons/logo.svg" type="image/svg+xml" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/** Full-screen spinner while the next page's data loads. Waits 150ms so fast navigations don't flash. */
function NavigationSpinner() {
  const navigation = useNavigation();
  const { pathname } = useLocation();
  const next = navigation.location?.pathname ?? "";
  // Between two different admin pages the admin layout shows a page skeleton instead
  const busy = navigation.state === "loading" && !(isAdminPath(pathname) && isAdminPath(next) && next !== pathname);
  return (
    <div
      aria-hidden={!busy}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-surface/55 backdrop-blur-[2px] transition-opacity ${
        busy ? "opacity-100 delay-150 duration-200" : "opacity-0 pointer-events-none duration-150"
      }`}
    >
      <Spinner label="Loading" />
    </div>
  );
}

/** Shown on the very first load while client data is fetched. */
export function HydrateFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-light-200">
      <Spinner label="Loading TravelSphere" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <NavigationSpinner />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred. Please try again.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Page not found" : `Error ${error.status}`;
    details =
      error.status === 404
        ? "The page you are looking for does not exist or has moved."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen bg-light-200 flex items-center justify-center px-4 py-16">
      <section className="w-full max-w-xl bg-surface rounded-3xl border border-light-400 shadow-sm p-8 md:p-12 flex flex-col items-center gap-5 text-center">
        <img src="/assets/icons/logo.svg" alt="" className="size-12" />
        <h1 className="text-3xl font-bold text-dark-100">{message}</h1>
        <p className="text-gray-100 leading-7">{details}</p>
        <a
          href="/"
          className="bg-primary-100 hover:bg-primary-500 text-white font-semibold rounded-full px-6 py-3 transition-colors"
        >
          Back to home
        </a>
        {stack && (
          <pre className="w-full text-left text-xs bg-light-200 rounded-xl p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </section>
    </main>
  );
}

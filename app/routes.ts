import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    route('sign-in', 'routes/root/sign-in.tsx'),
    route('api/create-trip', 'routes/api/create-trip.ts'),
    route('api/admin', 'routes/api/admin.ts'),
    layout("routes/root/travel-layout.tsx", [
        index('routes/root/travel-page.tsx'),
        route('travel', 'routes/root/travel-trips.tsx'),
        route('travel/:tripId', 'routes/root/travel-trip-detail.tsx'),
        route('plan', 'routes/root/plan-trip.tsx'),
        route('account', 'routes/root/account.tsx'),
        route('*', 'routes/root/not-found.tsx'),
    ]),
    layout("routes/admin/admin-layout.tsx", [
        route("dashboard", "routes/admin/dashboard.tsx"),
        route("analytics", "routes/admin/analytics.tsx"),
        route("all-users", "routes/admin/all-users.tsx"),
        route("trips", "routes/admin/trips.tsx"),
        route("trips/create", "routes/admin/create-trip.tsx"),
        route("trips/:tripId", "routes/admin/trip-detail.tsx"),
        route("bookings", "routes/admin/bookings.tsx"),
    ]),
] satisfies RouteConfig;

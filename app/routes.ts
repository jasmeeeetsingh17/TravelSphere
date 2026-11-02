import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    route('sign-in', 'routes/root/sign-in.tsx'),
    layout("routes/root/travel-layout.tsx", [
        index('routes/root/travel-page.tsx'),
        route('travel', 'routes/root/travel-trips.tsx'),
        route('travel/:tripId', 'routes/root/travel-trip-detail.tsx'),
    ]),
    layout("routes/admin/admin-layout.tsx", [
        route("dashboard", "routes/admin/dashboard.tsx"),
        route("all-users", "routes/admin/all-users.tsx"),
        route("trips", "routes/admin/trips.tsx"),
        route("trips/:tripId", "routes/admin/trip-detail.tsx"),
    ]),
] satisfies RouteConfig;
import { Outlet, redirect, useLocation, useNavigation } from "react-router";
import { MobileSidebar, NavItems } from "../../../components";
import AdminTopbar from "../../../components/AdminTopbar";
import { AdminPageSkeleton, AdminShellSkeleton, isAdminPath, useDelayed } from "../../../components/Skeleton";
import { getUser, isAdmin, logoutUser } from "~/appwrite/auth";
import { AdminFeedProvider } from "~/lib/admin-feed";

/**
 * Only admins may open the panel.
 * Guests go to sign-in. Anyone else is signed out and told they are not an admin.
 */
export async function clientLoader() {
  const user = await getUser();
  if (!user) return redirect("/sign-in");
  if (!isAdmin(user)) {
    await logoutUser();
    return redirect("/sign-in?error=not-admin");
  }
  return user;
}

export function HydrateFallback() {
  return <AdminShellSkeleton />;
}

const AdminLayout = () => {
  // Moving to another admin page shows a page skeleton while its data loads
  const navigation = useNavigation();
  const { pathname } = useLocation();
  const next = navigation.location?.pathname;
  const switching = useDelayed(navigation.state === "loading" && !!next && next !== pathname && isAdminPath(next));

  return (
  <div className="admin-layout">
    <AdminFeedProvider>
    <MobileSidebar />

    <aside className="hidden lg:block w-68 shrink-0 h-screen sticky top-0">
      <NavItems />
    </aside>

    <section className="children">
      <AdminTopbar />
      <div className="pt-6 lg:pt-8">
        {switching ? <AdminPageSkeleton /> : <Outlet />}
      </div>
    </section>
    </AdminFeedProvider>
  </div>
  );
};

export default AdminLayout;

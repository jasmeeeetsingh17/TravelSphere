import { Outlet, redirect } from "react-router";
import { MobileSidebar, NavItems } from "../../../components";
import Spinner from "../../../components/Spinner";
import { getUser, isAdmin, logoutUser } from "~/appwrite/auth";

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
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-light-200">
      <Spinner label="Opening dashboard" />
    </div>
  );
}

const AdminLayout = () => (
  <div className="admin-layout">
    <MobileSidebar />

    <aside className="hidden lg:block w-68 shrink-0 h-screen sticky top-0">
      <NavItems />
    </aside>

    <section className="children">
      <Outlet />
    </section>
  </div>
);

export default AdminLayout;

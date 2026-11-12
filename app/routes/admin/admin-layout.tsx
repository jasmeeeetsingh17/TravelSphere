import { Outlet, redirect } from "react-router";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { MobileSidebar, NavItems } from "../../../components";
import { getUser, isAdmin } from "~/appwrite/auth";

/** Only admins may open the dashboard. Guests go to sign-in, travellers go home. */
export async function clientLoader() {
  const user = await getUser();
  if (!user) return redirect("/sign-in");
  if (!isAdmin(user)) return redirect("/");
  return user;
}

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <MobileSidebar />

      <aside className="w-full max-w-67.5 hidden lg:block">
        <SidebarComponent width={270} enableGestures={false}>
          <NavItems />
        </SidebarComponent>
      </aside>

      <aside className="children">
        <Outlet />
      </aside>
    </div>
  )
}
export default AdminLayout
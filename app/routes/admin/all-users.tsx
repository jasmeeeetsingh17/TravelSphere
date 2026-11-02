import { ColumnDirective, ColumnsDirective, GridComponent, Inject, Page, Sort } from "@syncfusion/ej2-react-grids";
import { Header } from "../../../components";
import { getAllUsers, type UserRow } from "~/appwrite/users";
import { users as sampleUsers } from "~/constants";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/all-users";

export const clientLoader = async () => {
    const users = await getAllUsers();
    // Falls back to the sample users when the collection is empty or can't be read.
    return users.length ? users : (sampleUsers as unknown as UserRow[]);
};

const nameCell = (u: UserRow) => (
    <span className="flex items-center gap-3">
        <img src={u.imageUrl} alt={u.name} referrerPolicy="no-referrer" className="size-9 rounded-full aspect-square object-cover" />
        <span className="font-medium text-dark-100">{u.name}</span>
    </span>
);

const statusCell = (u: UserRow) => (
    <span
        className={cn(
            "px-3 py-1 rounded-full text-xs font-medium capitalize",
            u.status === "admin" ? "bg-success-50 text-success-700" : "bg-light-300 text-gray-500"
        )}
    >
        {u.status}
    </span>
);

const AllUsers = ({ loaderData }: Route.ComponentProps) => (
    <main className="dashboard wrapper">
        <Header title="Manage Users" description="Filter, sort and review the people using TravelSphere." />

        <GridComponent dataSource={loaderData as UserRow[]} gridLines="None" allowSorting allowPaging pageSettings={{ pageSize: 10 }}>
            <ColumnsDirective>
                <ColumnDirective field="name" headerText="Name" width="240" template={nameCell} />
                <ColumnDirective field="email" headerText="Email" width="240" />
                <ColumnDirective field="dateJoined" headerText="Date Joined" width="160" />
                <ColumnDirective field="status" headerText="Status" width="120" template={statusCell} />
            </ColumnsDirective>
            <Inject services={[Page, Sort]} />
        </GridComponent>
    </main>
);

export default AllUsers;
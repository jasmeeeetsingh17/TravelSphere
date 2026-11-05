import { ColumnDirective, ColumnsDirective, GridComponent, Inject, Page, Sort } from "@syncfusion/ej2-react-grids";
import { Header } from "../../../components";
import { bookings, type Booking } from "~/constants/bookings";
import { cn } from "~/lib/utils";

const statusStyles: Record<Booking["status"], string> = {
    Confirmed: "bg-success-50 text-success-700",
    Pending: "bg-red-50 text-red-500",
    Cancelled: "bg-light-300 text-gray-500",
};

const statusCell = (b: Booking) => (
    <span className={cn("px-3 py-1 rounded-full text-xs font-medium", statusStyles[b.status])}>{b.status}</span>
);

const amountCell = (b: Booking) => <span className="font-medium text-dark-100">${b.amount.toLocaleString()}</span>;

const confirmed = bookings.filter((b) => b.status === "Confirmed");
const revenue = confirmed.reduce((sum, b) => sum + b.amount, 0);

const summary = [
    { label: "Total bookings", value: bookings.length },
    { label: "Confirmed", value: confirmed.length },
    { label: "Confirmed revenue", value: `$${revenue.toLocaleString()}` },
];

const Bookings = () => (
    <main className="dashboard wrapper">
        <Header title="All Bookings" description="Track who booked which trip and the status of each booking." />

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summary.map(({ label, value }) => (
                <li key={label} className="bg-white rounded-20 shadow-400 p-6 flex flex-col gap-2">
                    <span className="text-sm text-gray-100">{label}</span>
                    <strong className="text-3xl font-bold text-dark-100">{value}</strong>
                </li>
            ))}
        </ul>

        <GridComponent dataSource={bookings} gridLines="None" allowSorting allowPaging pageSettings={{ pageSize: 8 }}>
            <ColumnsDirective>
                <ColumnDirective field="id" headerText="Booking ID" width="120" />
                <ColumnDirective field="traveller" headerText="Traveller" width="170" />
                <ColumnDirective field="trip" headerText="Trip" width="200" />
                <ColumnDirective field="travelDate" headerText="Travel Date" width="150" />
                <ColumnDirective field="guests" headerText="Guests" width="100" />
                <ColumnDirective field="amount" headerText="Amount" width="120" template={amountCell} />
                <ColumnDirective field="status" headerText="Status" width="130" template={statusCell} />
            </ColumnsDirective>
            <Inject services={[Page, Sort]} />
        </GridComponent>
    </main>
);

export default Bookings;

import { cn } from "~/lib/utils";

type CellUser = { name: string; imageUrl: string; status?: string };

export const nameCell = (u: CellUser) => (
    <span className="flex items-center gap-3">
        <img
            src={u.imageUrl}
            alt={u.name}
            referrerPolicy="no-referrer"
            className="size-9 rounded-full aspect-square object-cover"
        />
        <span className="font-medium text-dark-100">{u.name}</span>
    </span>
);

export const statusCell = (u: CellUser) => (
    <span
        className={cn(
            "px-3 py-1 rounded-full text-xs font-medium capitalize",
            u.status === "admin" ? "bg-success-50 text-success-700" : "bg-light-300 text-gray-500"
        )}
    >
        {u.status}
    </span>
);
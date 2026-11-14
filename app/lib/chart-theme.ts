/** One look for every Syncfusion chart in the app. */
export const COLORS = {
    blue: "#256ff1",
    green: "#10b981",
    amber: "#f59e0b",
    pink: "#ec4899",
    violet: "#8b5cf6",
    gray: "#cbd5e1",
};


const label = { color: "#6b7280", size: "12px", fontWeight: "500" };

export const categoryAxis = {
    valueType: "Category" as const,
    majorGridLines: { width: 0 },
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    labelStyle: label,
};

export const valueAxis = (extra: Record<string, unknown> = {}) => ({
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    majorGridLines: { width: 1, color: "#eef0f4", dashArray: "4,4" },
    labelStyle: { ...label, color: "#9ca3af" },
    ...extra,
});

export const chartArea = { border: { width: 0 } };

export const legend = { visible: true, position: "Top" as const, alignment: "Far" as const, enableHighlight: true, padding: 12 };

export const tooltip = { enable: true, shared: true, header: "", format: "<b>${series.name}</b>: ${point.y}" };

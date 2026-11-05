import { world_map } from "./world_map";

/** Country names from the world map file, so a chosen country always matches a shape on the map. */
export const countries: string[] = Array.from(
    new Set(
        ((world_map as { features: { properties: { name: string } }[] }).features ?? [])
            .map((f) => f.properties.name)
            .filter(Boolean)
    )
).sort((a, b) => a.localeCompare(b));

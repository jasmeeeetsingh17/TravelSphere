import { LayerDirective, LayersDirective, MapsComponent } from "@syncfusion/ej2-react-maps";
import { world_map } from "~/constants/world_map";

/** World map with the trip's country highlighted. Loaded lazily because the map data is large. */
const TripMap = ({ country }: { country: string }) => (
    <MapsComponent id="trip-map" height="320px" zoomSettings={{ enable: false }}>
        <LayersDirective>
            <LayerDirective
                shapeData={world_map}
                shapePropertyPath="name"
                shapeDataPath="name"
                dataSource={[{ name: country, color: "#256ff1" }]}
                shapeSettings={{ fill: "#e3f1ff", colorValuePath: "color", border: { color: "#ffffff", width: 0.4 } }}
            />
        </LayersDirective>
    </MapsComponent>
);

export default TripMap;

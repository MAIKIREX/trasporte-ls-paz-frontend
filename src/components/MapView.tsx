// components/MapView.tsx
"use client";

import { useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
} from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Position } from "../hook/useCurrentPosition";

interface MapViewProps {
    origen: Position | null;
    destino: Position | null;
}

const userIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const destIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function LocationMarker({ onClickMap }: { onClickMap: (p: Position) => void }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onClickMap({ lat, lng });
        },
    });
    return null;
}

export default function MapView({ origen, destino }: MapViewProps) {
    const [clickedPos, setClickedPos] = useState<Position | null>(null);

    if (!origen)
        return (
            <p className="text-center py-10 text-muted-foreground">
                Obteniendo ubicación…
            </p>
        );

    const center: LatLngExpression = [origen.lat, origen.lng];

    return (
        <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom
            className="h-80 w-full rounded-2xl overflow-hidden shadow border"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
            />

            <Marker position={[origen.lat, origen.lng]} icon={userIcon}>
                <Popup>Tu ubicación actual</Popup>
            </Marker>

            {destino && (
                <Marker position={[destino.lat, destino.lng]} icon={destIcon}>
                    <Popup>Destino</Popup>
                </Marker>
            )}

            <LocationMarker onClickMap={setClickedPos} />

            {clickedPos && (
                <Marker position={[clickedPos.lat, clickedPos.lng]}>
                    <Popup>Ubicación seleccionada</Popup>
                </Marker>
            )}
        </MapContainer>
    );
}

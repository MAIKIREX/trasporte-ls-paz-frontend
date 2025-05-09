import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface RouteMapProps {
    coordinates: [number, number][]; // formato: [lng, lat]
    zoom?: number;
}

export default function RouteMap({ coordinates, zoom = 15 }: RouteMapProps) {
    const [matchedCoords, setMatchedCoords] = useState<[number, number][]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!coordinates.length) return;

        const controller = new AbortController();

        async function fetchMatch() {
            try {
                setLoading(true);
                const coordStr = coordinates
                    .map(([lng, lat]) => `${lng},${lat}`)
                    .join(";");
                const url = `https://router.project-osrm.org/match/v1/driving/${coordStr}?geometries=geojson&overview=full&tidy=true`;

                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok)
                    throw new Error(`OSRM match error (${res.status})`);

                const json = await res.json();
                if (!json.matchings?.length) {
                    throw new Error(
                        "No se pudo calzar la ruta (matchings vacío)"
                    );
                }

                const geoCoords: [number, number][] =
                    json.matchings[0].geometry.coordinates;
                setMatchedCoords(geoCoords);
                setError(null);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError")
                    return;
                setError((err as Error).message);
                setMatchedCoords([]);
            } finally {
                setLoading(false);
            }
        }

        fetchMatch();
        return () => controller.abort();
    }, [coordinates]);

    const center = useMemo(() => {
        const [lng0, lat0] = coordinates[0];
        return [lat0, lng0];
    }, [coordinates]);

    return (
        <div className="relative w-full h-screen">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom
                className="w-full h-full z-0"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                />

                {matchedCoords.length > 0 && (
                    <Polyline
                        positions={matchedCoords.map(([lng, lat]) => [
                            lat,
                            lng,
                        ])}
                        weight={5}
                        color="blue"
                    />
                )}
            </MapContainer>

            {loading && (
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-sm px-4 py-2 rounded shadow z-10">
                    Calculando ruta...
                </div>
            )}

            {error && (
                <div className="absolute top-4 left-4 bg-red-100 text-red-800 text-sm px-4 py-2 rounded shadow z-10">
                    {error}
                </div>
            )}
        </div>
    );
}

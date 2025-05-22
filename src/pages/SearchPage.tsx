"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePositionStore } from "../stores/usePositionStore";
import Header from "../components/Header";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const fallbackPosition = { lat: -16.5, lng: -68.15 };

type Suggestion = {
    name: string;
    lat: number;
    lng: number;
};

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const currentPosition = usePositionStore((state) => state.position);

    const fetchSuggestions = async (query: string) => {
        if (!currentPosition || !query) return;

        try {
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${currentPosition.lat}&lon=${currentPosition.lng}&limit=10`
            );
            const data = await response.json();

            const filtered = data.features
                .filter((f: any) => f.properties.country === "Bolivia")
                .sort((a: any, b: any) => {
                    const getDistance = (lat: number, lon: number) => {
                        const dx = lat - currentPosition.lat;
                        const dy = lon - currentPosition.lng;
                        return Math.sqrt(dx * dx + dy * dy);
                    };
                    return (
                        getDistance(a.geometry.coordinates[1], a.geometry.coordinates[0]) -
                        getDistance(b.geometry.coordinates[1], b.geometry.coordinates[0])
                    );
                })
                .map((f: any) => ({
                    name: f.properties.name,
                    lat: f.geometry.coordinates[1],
                    lng: f.geometry.coordinates[0],
                }))
                .filter((s: Suggestion) => s.name);

            setSuggestions(filtered.slice(0, 5));
        } catch (error) {
            console.error("Error al obtener sugerencias:", error);
        }
    };

    const handleSearch = async () => {
        setErrorMessage(null);

        if (!currentPosition || !searchTerm) return;

        try {
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(searchTerm)}&lat=${currentPosition.lat}&lon=${currentPosition.lng}&limit=1`
            );
            const data = await response.json();

            if (!data.features || data.features.length === 0) {
                setErrorMessage("No se encontró el lugar. Intenta con otro nombre.");
                return;
            }

            const place = data.features[0];
            setDestinationCoords({
                lat: place.geometry.coordinates[1],
                lng: place.geometry.coordinates[0],
            });
        } catch (err) {
            console.error("Error al buscar lugar:", err);
            setErrorMessage("Hubo un problema al buscar el lugar.");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setErrorMessage(null);
        setDestinationCoords(null);
        fetchSuggestions(value);
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        setSearchTerm(suggestion.name);
        setSuggestions([]);
        setDestinationCoords({ lat: suggestion.lat, lng: suggestion.lng });
        setErrorMessage(null);
    };

    return (
        <div className="space-y-6 pb-16 px-4 max-w-2xl mx-auto">
            <Header title="Ciencia Link" />

            <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                    Ingresa la zona donde quieres ir
                </p>

                <div className="relative">
                    <Input
                        placeholder="Ej. Zona Sur"
                        value={searchTerm}
                        onChange={handleInputChange}
                        className="w-full"
                    />
                    {suggestions.length > 0 && (
                        <ul className="absolute z-1000 bg-white shadow-xl border rounded-md mt-1 w-full max-h-48 overflow-y-auto text-sm">
                            {suggestions.map((s, i) => (
                                <li
                                    key={i}
                                    className="p-2 hover:bg-primary/10 cursor-pointer transition-colors"
                                    onClick={() => handleSuggestionClick(s)}
                                >
                                    {s.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <Button onClick={handleSearch} className="w-full sm:w-auto">
                    Buscar
                </Button>

                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm flex items-center gap-2">
                        <span>⚠️</span>
                        {errorMessage}
                    </div>
                )}
            </div>

            <div className="rounded-xl overflow-hidden shadow-md border mt-6 h-[400px] sm:h-[500px]">
                <MapContainer
                    center={currentPosition || fallbackPosition}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {currentPosition && (
                        <Marker position={currentPosition}>
                            <Popup>Tu ubicación actual</Popup>
                        </Marker>
                    )}
                    {destinationCoords && (
                        <Marker position={destinationCoords}>
                            <Popup>Destino: {searchTerm}</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default SearchPage;

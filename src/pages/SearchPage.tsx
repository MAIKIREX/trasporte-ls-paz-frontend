"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Header from "../components/Header";
import SearchInput from "../components/SearchInput";
import ActionButton from "../components/ActionButton";
import { usePositionStore } from "../stores/usePositionStore";
import L from "leaflet";

// Configurar íconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const fallbackPosition = { lat: -16.5, lng: -68.15 }; // La Paz

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const currentPosition = usePositionStore((state) => state.position);

    // Fetch sugerencias filtradas y ordenadas por cercanía en Bolivia
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
                    return getDistance(a.geometry.coordinates[1], a.geometry.coordinates[0]) -
                           getDistance(b.geometry.coordinates[1], b.geometry.coordinates[0]);
                });
            const names = filtered.map((f: any) => f.properties.name).filter(Boolean);
            setSuggestions(names.slice(0, 5));
        } catch (error) {
            console.error("Error al obtener sugerencias:", error);
        }
    };

    // Debounce de sugerencias
    useEffect(() => {
        const delay = setTimeout(() => {
            if (searchTerm) fetchSuggestions(searchTerm);
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    // Geocodificación con prioridad a cercanía (Nominatim)
    const getCoordinatesFromPlaceName = async (place: string) => {
        if (!currentPosition) return null;

        const delta = 0.5;
        const viewbox = [
            currentPosition.lng - delta,
            currentPosition.lat + delta,
            currentPosition.lng + delta,
            currentPosition.lat - delta,
        ].join(',');

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&countrycodes=bo&viewbox=${viewbox}&bounded=1`
            );
            const data = await response.json();
            if (data.length === 0) return null;
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
            };
        } catch (error) {
            console.error("Error al obtener coordenadas:", error);
            return null;
        }
    };

    const handleSearch = async () => {
        setErrorMessage(null);
        const placeCoords = await getCoordinatesFromPlaceName(searchTerm);

        if (!placeCoords) {
            setErrorMessage("No se encontró el lugar. Intenta con otro nombre.");
            return;
        }

        setDestinationCoords(placeCoords);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setSearchTerm(suggestion);
        setSuggestions([]);
    };

    return (
        <div className="space-y-6 pb-16">
            <Header title="Ciencia Link" />

            <div className="space-y-4">
                <p className="text-sm font-medium">Ingresa la zona donde quieres ir</p>

                <div className="relative">
                    <SearchInput
                        placeholder="Zona sur"
                        value={searchTerm}
                        onChange={handleInputChange}
                    />
                    {suggestions.length > 0 && (
                        <ul className="absolute z-10 bg-white shadow border rounded mt-1 w-full max-h-48 overflow-y-auto">
                            {suggestions.map((s, i) => (
                                <li
                                    key={i}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSuggestionClick(s)}
                                >
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <ActionButton label="Buscar" onClick={handleSearch} />

                {errorMessage && (
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                )}
            </div>

            <div className="rounded-2xl overflow-hidden shadow border mt-6 h-[400px]">
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

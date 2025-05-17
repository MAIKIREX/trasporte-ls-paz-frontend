"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Header from "../components/Header";
import SearchInput from "../components/SearchInput";
import ActionButton from "../components/ActionButton";
import { usePositionStore } from "../stores/usePositionStore";
import L from "leaflet";

// Asegura que los íconos funcionen correctamente en Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);

    const currentPosition = usePositionStore((state) => state.position);

    // Sugerencias usando Photon
    const fetchSuggestions = async (query: string) => {
        if (!currentPosition || !query) return;

        const response = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${currentPosition.lat}&lon=${currentPosition.lng}`
        );
        const data = await response.json();
        const names = data.features.map((f: any) => f.properties.name).filter(Boolean);
        setSuggestions(names.slice(0, 5));
    };

    // Obtiene coordenadas del lugar ingresado
    const getCoordinatesFromPlaceName = async (place: string) => {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
        );
        const data = await response.json();
        if (data.length === 0) return null;
        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
        };
    };

    const handleSearch = async () => {
        const placeCoords = await getCoordinatesFromPlaceName(searchTerm);

        if (!currentPosition) {
            console.warn("Ubicación actual no disponible");
        }

        if (!placeCoords) {
            console.warn("No se encontraron coordenadas para:", searchTerm);
            return;
        }

        console.log("📍 Ubicación actual:", currentPosition);
        console.log("📌 Coordenadas del destino:", placeCoords);

        setDestinationCoords(placeCoords); // para mostrar en el mapa
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchSuggestions(value);
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
            </div>

            <div className="rounded-2xl overflow-hidden shadow border mt-6 h-[400px]">
                {currentPosition && (
                    <MapContainer
                        center={currentPosition}
                        zoom={14}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={currentPosition}>
                            <Popup>Tu ubicación actual</Popup>
                        </Marker>
                        {destinationCoords && (
                            <Marker position={destinationCoords}>
                                <Popup>Destino: {searchTerm}</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default SearchPage;

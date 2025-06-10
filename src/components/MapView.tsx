"use client";

import { useState, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents,
} from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

import { useCurrentPosition } from "../hook/useCurrentPosition";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Position {
    lat: number;
    lng: number;
}

/* ---------- Iconos ---------- */
const userIcon = new Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
});

const destIcon = new Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
});

/* ---------- Selector de clic ---------- */
function LocationSelector({ onSelect }: { onSelect: (p: Position) => void }) {
    useMapEvents({
        click(e) {
            onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

/* ---------- Controlador de cámara ---------- */
function MapController({ center }: { center: LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom(), { duration: 0.8 });
    }, [center, map]);
    return null;
}

/* ---------- Componente principal ---------- */
export default function MapView() {
    const initialCenter: LatLngExpression = [-16.5, -68.15]; // La Paz
    const [center, setCenter] = useState<LatLngExpression>(initialCenter);

    const { pos, error } = useCurrentPosition();

    /* ORIGEN */
    const [originOption, setOriginOption] = useState<string>("origen");
    const [manualOrigin, setManualOrigin] = useState<Position | null>(null);

    /* DESTINO */
    const [destinationOption, setDestinationOption] = useState<string>("destino");
    const [manualDestination, setManualDestination] = useState<Position | null>(null);

    /* -------- Handlers -------- */
    const handleOriginChange = (v: string) => {
        setOriginOption(v);
        setManualOrigin(null);
        if (v === "ubicacion" && pos) setCenter([pos.lat, pos.lng]);
    };

    const handleDestinationChange = (v: string) => {
        setDestinationOption(v);
        setManualDestination(null);
        if (v === "ubicacion" && pos) setCenter([pos.lat, pos.lng]);
    };

    const handleManualOrigin = (p: Position) => {
        setManualOrigin(p);
        setCenter([p.lat, p.lng]);
    };

    const handleManualDestination = (p: Position) => {
        setManualDestination(p);
        setCenter([p.lat, p.lng]);
    };

    const handleSearch = () => {
        const origin = originOption === "ubicacion" ? pos : manualOrigin;
        const dest = destinationOption === "ubicacion" ? pos : manualDestination;

        if (!origin || !dest) {
            console.warn("Origen y/o destino faltantes");
            return;
        }
        console.log("Origen:", origin);
        console.log("Destino:", dest);
    };

    const handleClearAll = () => {
        setOriginOption("origen");
        setManualOrigin(null);
        setDestinationOption("destino");
        setManualDestination(null);
        setCenter(initialCenter);
    };

    /* -------- Auto-centrar cuando llegue el GPS -------- */
    useEffect(() => {
        if (pos && originOption === "ubicacion" && !manualOrigin) {
            setCenter([pos.lat, pos.lng]);
        }
        if (pos && destinationOption === "ubicacion" && !manualDestination) {
            setCenter([pos.lat, pos.lng]);
        }
    }, [pos, originOption, destinationOption, manualOrigin, manualDestination]);

    /* -------- Flags -------- */
    const hasOriginSelected =
        (originOption === "ubicacion" && !!pos) ||
        (originOption === "mapa" && !!manualOrigin);
    const hasDestinationSelected =
        (destinationOption === "ubicacion" && !!pos) ||
        (destinationOption === "mapa" && !!manualDestination);
    const isSearchDisabled = !hasOriginSelected || !hasDestinationSelected;
    const showMapHint =
        (originOption === "mapa" && !manualOrigin) ||
        (destinationOption === "mapa" && !manualDestination);
    const showClearButton = hasOriginSelected && hasDestinationSelected;

    /* -------- Render -------- */
    return (
        <div className="w-full h-screen flex flex-col">
            {/* ----- Barra de controles ----- */}
            <div className="p-4 grid grid-cols-5 gap-2 bg-white shadow-md z-10">
                {/* Select ORIGEN */}
                <div className="col-span-4 w-full md:w-auto">
                    <Select
                        value={originOption}
                        onValueChange={handleOriginChange}
                    >
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Selecciona origen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="origen">Origen</SelectItem>
                            <SelectItem value="ubicacion">Ubicación actual</SelectItem>
                            <SelectItem value="mapa">Elegir en el mapa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Select DESTINO */}
                <div className="row-start-2 col-span-4 w-full md:w-auto">
                    <Select
                        value={destinationOption}
                        onValueChange={handleDestinationChange}
                    >
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Selecciona destino" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="destino">Destino</SelectItem>
                            <SelectItem value="ubicacion">Ubicación actual</SelectItem>
                            <SelectItem value="mapa">Elegir en el mapa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Botón BUSCAR */}
                <Button
                    onClick={handleSearch}
                    className="col-span-1 items-center justify-center"
                    disabled={isSearchDisabled}
                >
                    <Search className="w-4 h-4" />
                </Button>

                {/* Botón LIMPIAR debajo del BUSCAR */}
                {showClearButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClearAll}
                        className="row-start-2 col-span-1 items-center justify-center"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </Button>
                )}
            </div>

            {/* Mensajes informativos */}
            {showMapHint && (
                <div className="bg-blue-50 text-blue-700 text-center py-2 text-sm z-10">
                    Haz clic en el mapa para seleccionar una ubicación.
                </div>
            )}
            {originOption === "ubicacion" && !pos && (
                <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm z-10">
                    Obteniendo tu ubicación actual...
                </div>
            )}
            {error && (
                <div className="bg-red-100 text-red-800 text-center py-2 text-sm z-10">
                    Error obteniendo ubicación: {error}
                </div>
            )}

            {/* ----- Mapa ----- */}
            <div className="flex-1 rounded-lg overflow-hidden">
                <MapContainer
                    center={center}
                    zoom={14}
                    scrollWheelZoom
                    className="h-full w-full z-0"
                >
                    <MapController center={center} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap"
                    />

                    {/* ORIGEN */}
                    {originOption === "ubicacion" && pos && (
                        <Marker position={[pos.lat, pos.lng]} icon={userIcon}>
                            <Popup>Origen: Tu ubicación actual</Popup>
                        </Marker>
                    )}
                    {originOption === "mapa" && !manualOrigin && (
                        <LocationSelector onSelect={handleManualOrigin} />
                    )}
                    {manualOrigin && (
                        <Marker position={[manualOrigin.lat, manualOrigin.lng]} icon={userIcon}>
                            <Popup>Origen seleccionado</Popup>
                        </Marker>
                    )}

                    {/* DESTINO */}
                    {destinationOption === "ubicacion" && pos && (
                        <Marker position={[pos.lat, pos.lng]} icon={destIcon}>
                            <Popup>Destino: Tu ubicación actual</Popup>
                        </Marker>
                    )}
                    {destinationOption === "mapa" && !manualDestination && (
                        <LocationSelector onSelect={handleManualDestination} />
                    )}
                    {manualDestination && (
                        <Marker position={[manualDestination.lat, manualDestination.lng]} icon={destIcon}>
                            <Popup>Destino seleccionado</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}

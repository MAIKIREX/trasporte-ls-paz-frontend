import { useEffect, useState } from "react";

export interface Position {
    lat: number;
    lng: number;
}

export function useCurrentPosition() {
    const [pos, setPos] = useState<Position | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocalización no soportada");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) =>
                setPos({ lat: coords.latitude, lng: coords.longitude }),
            (err) => setError(err.message),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    return { pos, error };
}

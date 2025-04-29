import { useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import { useCurrentPosition } from "../hook/useCurrentPosition";
import { useState } from "react";
import { HomeIcon, BriefcaseIcon, GraduationCapIcon } from "lucide-react";
import Header from "../components/Header";

export default function MainPage() {
    const navigate = useNavigate();
    const { pos } = useCurrentPosition();
    const [destinoPos, setDestinoPos] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Ciencia Link" />

            <main className="flex-1 overflow-y-auto pt-5 mx-auto w-full max-w-sm p-4 space-y-6">

                <section className="space-y-1">
                    <h2 className="text-sm font-medium">Tu estás aquí</h2>
                    
                    {/* Pasamos la función para manejar cambios */}
                    <MapView 
                        origen={pos} 
                        destino={destinoPos} 
                        onMarkerChange={setDestinoPos} 
                    />
                </section>

                <section className="rounded-2xl border shadow p-4 bg-background/95 backdrop-blur-lg">
                    <h3 className="text-base font-semibold mb-3">
                        Ubicaciones
                    </h3>

                    <ul className="space-y-3">
                        <LocationRow
                            icon={<HomeIcon className="h-5 w-5" />}
                            label="Casa"
                            onClick={() => navigate("/search")}
                        />
                        <LocationRow
                            icon={<BriefcaseIcon className="h-5 w-5" />}
                            label="Trabajo"
                            onClick={() => navigate("/search")}
                        />
                        <LocationRow
                            icon={<GraduationCapIcon className="h-5 w-5" />}
                            label="Universidad"
                            onClick={() => navigate("/search")}
                        />
                    </ul>
                </section>
            </main>
        </div>
    );
}

function LocationRow({
    icon,
    label,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <li
            onClick={onClick}
            className="flex items-center gap-4 cursor-pointer rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
        >
            <span className="shrink-0 text-primary">{icon}</span>
            <div className="flex flex-col text-sm leading-tight">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">Establecer</span>
            </div>
        </li>
    );
}

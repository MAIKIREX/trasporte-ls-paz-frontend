import Header from "../components/Header";
import MapPlaceholder from "../components/MapPlaceholder";

const RoutePage = () => {
    return (
        <div className="space-y-6 pb-16">
            <Header title="Ciencia Link" />

            <div className="space-y-4">
                <MapPlaceholder message="Mapa de ruta" />

                <div className="rounded-2xl border shadow p-4 bg-background/95 backdrop-blur-lg">
                    <div className="space-y-1">
                        <p className="text-sm text-gray-500">Número de placa</p>
                        <p className="font-medium">781-PLA</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-gray-500">Número de placa</p>
                        <p className="font-medium">1311-ABC</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-gray-500">Número de placa</p>
                        <p className="font-medium">1025-ZXY</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoutePage;

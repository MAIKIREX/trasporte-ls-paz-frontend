import Header from "../components/Header";
import RouteMap from "../components/RouteMap";
import rutaLaPaz from "../data/rutaLaPaz";

const datos: [number, number][] = rutaLaPaz;

const RoutePage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header title="Rutas"/>
            <main className="flex-1">
                <RouteMap coordinates={datos} />
            </main>
        </div>
    );
};

export default RoutePage;

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import simplify from 'simplify-js';

// 🔹 Tus puntos originales (pueden venir de un JSON externo)
const originalPoints = [
  [-68.11911607029036, -16.50137896529536],
  [-68.12100023482365, -16.501477954927196],
  [-68.1225402597163, -16.50153569885633],
  [-68.12297903775868, -16.50156044624903],
  [-68.12296183077645, -16.502715321060975],
  [-68.12292741681249, -16.5037052082681],
  [-68.12292996335215, -16.505112902009856],
  [-68.12288441100927, -16.505786529478456],
  [-68.12470432319319, -16.507628315624828],
  [-68.12534116792365, -16.508489536507824],
  [-68.1262987507206, -16.507745868190895],
  [-68.12735937176744, -16.50700485025773],
  [-68.12847134051374, -16.506223368952632],
  [-68.1296864547291, -16.505373913046697],
  [-68.13095832001467, -16.50429408017598],
  [-68.13141141185784, -16.50410432696789],
  [-68.1328006480791, -16.503731515234037],
  [-68.13389127269195, -16.50323122717579],
  [-68.1346771941291, -16.502436504903287],
  [-68.135163386242, -16.501912098350004],
  [-68.13573474528, -16.501338656748615],
  [-68.13637438361917, -16.50191617241684]
];

const MapView = () => {
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    // Paso 1: simplificar los puntos con simplify-js
    const pointsForSimplify = originalPoints.map(([lng, lat]) => ({ x: lng, y: lat }));

    const simplified = simplify(pointsForSimplify, 0.0008, true); // ajusta la tolerancia
    console.log(simplified);
    // Paso 2: convertir a string para OSRM
    const coordsStr = simplified.map(p => `${p.x},${p.y}`).join(';');

    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const rawCoords = data.routes[0].geometry.coordinates;
          const formatted = rawCoords.map(([lng, lat]) => [lat, lng]);
          setRouteCoords(formatted);
        }
      })
      .catch(err => console.error("Error al consultar OSRM:", err));
  }, []);

  const center = [-16.503, -68.125];

  return (
    <MapContainer center={center} zoom={14} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routeCoords.length > 0 && (
        <Polyline positions={routeCoords} color="green" weight={5} />
      )}
    </MapContainer>
  );
};

export default MapView;

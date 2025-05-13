import React, { useEffect, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
    ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const RESTAURANT_COORDS = [49.422983, 26.987133];
const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;

const customZoomStyle = `
  .leaflet-control-zoom {
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    border-radius: 6px;
    overflow: hidden;
  }
  .leaflet-control-zoom a {
    width: 32px;
    height: 32px;
    font-size: 20px;
    line-height: 32px;
  }
`;

const markerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -30],
});

const MapUpdater = ({ from, to }) => {
    const map = useMap();
    useEffect(() => {
        if (from && to) {
            const bounds = L.latLngBounds([from, to]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [from, to, map]);
    return null;
};

const MapView = ({ address }) => {
    const [userCoords, setUserCoords] = useState(null);
    const [route, setRoute] = useState([]);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchCoordinatesAndRoute = async () => {
            if (!address || address.trim().length < 3) {
                setStatus('');
                setUserCoords(null);
                setRoute([]);
                return;
            }

            setStatus('🔍 Пошук адреси...');
            try {
                const geo = await axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: `Хмельницький, ${address}`,
                        format: 'json',
                        limit: 1,
                    },
                });

                if (geo.data.length > 0) {
                    const coords = [parseFloat(geo.data[0].lat), parseFloat(geo.data[0].lon)];
                    setUserCoords(coords);
                    setStatus('✅ Адресу знайдено');

                    const orsRes = await axios.post(
                        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
                        {
                            coordinates: [
                                [RESTAURANT_COORDS[1], RESTAURANT_COORDS[0]],
                                [coords[1], coords[0]]
                            ]
                        },
                        {
                            headers: {
                                Authorization: ORS_API_KEY,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    const geometry = orsRes.data.features[0].geometry.coordinates;
                    const convertedRoute = geometry.map(coord => [coord[1], coord[0]]);
                    setRoute(convertedRoute);
                } else {
                    setUserCoords(null);
                    setRoute([]);
                    setStatus('❌ Адресу не знайдено');
                }
            } catch (error) {
                console.error('Geo or Route Error:', error);
                setUserCoords(null);
                setRoute([]);
                setStatus('❌ Помилка при обробці адреси');
            }
        };

        fetchCoordinatesAndRoute();
    }, [address]);

    return (
        <div style={{ height: '100%' }}>
            <style>{customZoomStyle}</style>

            {status && (
                <div style={{ marginBottom: '8px', fontWeight: 'bold', color: status.includes('❌') ? 'red' : 'green' }}>
                    {status}
                </div>
            )}

            <MapContainer
                center={RESTAURANT_COORDS}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '550px', width: '100%' }}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <Marker position={RESTAURANT_COORDS} icon={markerIcon}>
                    <Popup>Заклад</Popup>
                </Marker>

                {userCoords && (
                    <>
                        <Marker position={userCoords} icon={markerIcon}>
                            <Popup>Ваш будинок</Popup>
                        </Marker>
                        {route.length > 0 && <Polyline positions={route} color="blue" />}
                        <MapUpdater from={RESTAURANT_COORDS} to={userCoords} />
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default MapView;

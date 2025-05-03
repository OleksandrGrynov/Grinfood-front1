import React, { useEffect, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polygon,
    useMap,
    ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// 🧭 Стилі для ZoomControl вбудовані
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

// Зони
const zones = [
    {
        name: 'Зона 1',
        color: '#fdd83588',
        coordinates: [
            [49.4245, 26.9757],
            [49.4265, 26.9907],
            [49.418, 26.995],
            [49.416, 26.978],
        ],
    },
    {
        name: 'Зона 2',
        color: '#66bb6a88',
        coordinates: [
            [49.4305, 26.9700],
            [49.4325, 26.9850],
            [49.4240, 26.9860],
            [49.4220, 26.9720],
        ],
    },
];

const MapUpdater = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, 17);
        }
    }, [position, map]);
    return null;
};

const MapView = ({ address }) => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!address) return;
            try {
                const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: `Хмельницький, ${address}`,
                        format: 'json',
                        limit: 1,
                    },
                });

                if (data.length > 0) {
                    setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                }
            } catch (error) {
                console.error('Geo Error:', error);
            }
        };

        fetchCoordinates();
    }, [address]);

    return (
        <>
            {/* Вбудований стиль */}
            <style>{customZoomStyle}</style>

            <MapContainer
                center={[49.422983, 26.987133]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // Ховаємо стандартний zoom
            >
                {/* Нове положення ZoomControl */}
                <ZoomControl position="bottomright" />

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {zones.map((zone, idx) => (
                    <Polygon
                        key={idx}
                        positions={zone.coordinates}
                        pathOptions={{ color: zone.color }}
                    >
                        <Popup>{zone.name}</Popup>
                    </Polygon>
                ))}

                {position && (
                    <>
                        <MapUpdater position={position} />
                        <Marker position={position} icon={markerIcon}>
                            <Popup>Ваш будинок</Popup>
                        </Marker>
                    </>
                )}
            </MapContainer>
        </>
    );
};

export default MapView;

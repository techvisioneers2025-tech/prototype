import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { supabase } from '../supabaseClient';

// Custom red icon for emergencies
const emergencyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface TouristLocation {
  user_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  status: 'safe' | 'emergency';
}

const AuthorityDashboardPage = () => {
  const [locations, setLocations] = useState<TouristLocation[]>([]);
  const initialPosition: LatLngExpression = [20.5937, 78.9629]; // Default to center of India

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) {
        console.error('Error fetching locations:', error);
      } else {
        setLocations(data as TouristLocation[]);
      }
    };

    fetchLocations();

    const subscription = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'locations' },
        (payload) => {
          console.log('Change received!', payload);
          fetchLocations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="h-screen">
      <MapContainer center={initialPosition} zoom={5} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker
            key={loc.user_id}
            position={[loc.latitude, loc.longitude]}
            icon={loc.status === 'emergency' ? emergencyIcon : defaultIcon}
          >
            <Popup>
              Tourist ID: {loc.user_id} <br />
              Status: <span className={loc.status === 'emergency' ? 'font-bold text-red-500' : ''}>{loc.status}</span> <br />
              Last updated: {new Date(loc.updated_at).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AuthorityDashboardPage;

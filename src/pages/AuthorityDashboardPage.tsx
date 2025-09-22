import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { supabase } from '../supabaseClient';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ... (icon definitions remain the same)
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
  const [locations, setLocations] = useState<Map<string, TouristLocation>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const initialPosition: LatLngExpression = [20.5937, 78.9629]; // Default to center of India

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) {
        console.error('Error fetching locations:', error);
        setError(`Failed to fetch locations: ${error.message}`);
      } else {
        const locationsMap = new Map(data.map(loc => [loc.user_id, loc as TouristLocation]));
        setLocations(locationsMap);
      }
    };

    fetchLocations();

    const handleRealtimeUpdate = (payload: RealtimePostgresChangesPayload<TouristLocation>) => {
      console.log('Change received!', payload);
      const newRecord = payload.new as TouristLocation;
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        setLocations(prevLocations => new Map(prevLocations).set(newRecord.user_id, newRecord));
      } else if (payload.eventType === 'DELETE') {
        const oldRecord = payload.old as TouristLocation;
        setLocations(prevLocations => {
            const newMap = new Map(prevLocations);
            newMap.delete(oldRecord.user_id);
            return newMap;
        });
      }
    };

    const subscription = supabase.channel('public:locations')
      .on<TouristLocation>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'locations' },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
  }

  const locationsArray = Array.from(locations.values());

  return (
    <div className="h-screen relative">
      <MapContainer center={initialPosition} zoom={5} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locationsArray.map((loc) => (
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
      {locationsArray.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow-lg z-1000">
          <p>No active tourists being tracked.</p>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboardPage;

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { supabase } from '../supabaseClient';

const DashboardPage = () => {
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition: LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPosition);
        updateLocationInSupabase(newPosition);
      },
      (err) => {
        console.error(err);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);

  const updateLocationInSupabase = async (currentPosition: LatLngExpression) => {
    if (!user || !Array.isArray(currentPosition)) return;

    const { error } = await supabase.from('locations').upsert({
      user_id: user.id,
      latitude: currentPosition[0],
      longitude: currentPosition[1],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating location:', error);
    }
  };

  const handlePanic = async () => {
    if (!user) return;
    console.log('Panic button pressed!');
    const { error } = await supabase
      .from('locations')
      .update({ status: 'emergency', updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      alert('Emergency signal sent! Authorities have been notified.');
    }
  };

  return (
    <div className="relative h-screen">
      {position ? (
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              You are here.
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <div className="flex justify-center items-center h-full">
          <p>Getting your location...</p>
        </div>
      )}
      <button
        onClick={handlePanic}
        className="absolute bottom-10 right-10 bg-red-500 hover:bg-red-700 text-white font-bold rounded-full w-24 h-24 flex items-center justify-center text-lg z-1000 animate-pulse">
        PANIC
      </button>
    </div>
  );
};

export default DashboardPage;

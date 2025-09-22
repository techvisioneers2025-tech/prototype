import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

const DashboardPage = () => {
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [panicMessage, setPanicMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        setError("You are not logged in. Please login to use the dashboard.");
      }
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
        setError(`Geolocation error: ${err.message}`);
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
    setPanicMessage('Sending emergency signal...');
    const { error } = await supabase
      .from('locations')
      .update({ status: 'emergency', updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) {
      setPanicMessage(`Error: ${error.message}`);
    } else {
      setPanicMessage('Emergency signal sent! Authorities have been notified.');
    }
  };

  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
  }

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
      <div className="absolute bottom-10 right-10 z-1000">
        {panicMessage && <p className="text-white bg-black p-2 rounded mb-2">{panicMessage}</p>}
        <button
          onClick={handlePanic}
          className="bg-red-500 hover:bg-red-700 text-white font-bold rounded-full w-24 h-24 flex items-center justify-center text-lg animate-pulse">
          PANIC
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;

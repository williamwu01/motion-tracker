import React, { useRef, useEffect } from "react";

const Webcam = ({ width = 320, height = 240 }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        startWebcam();
    }, []);

    return <video ref={videoRef} autoPlay playsInline width={width} height={height} />;
};

export default Webcam;
import React, { useRef, useEffect } from "react";
import * as posedetection from "@tensorflow-models/pose-detection"; // TensorFlow.js pose detection API
import * as tf from "@tensorflow/tfjs"; // Core TensorFlow.js
import "@tensorflow/tfjs-backend-webgl"; // WebGL backend (GPU acceleration)

export default function PoseTracker() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    // WebGL is the browser’s graphics API
    useEffect(() => {
        const runPoseDetection = async () => {
            await tf.setBackend("webgl"); // Tell TFJS: use GPU through WebGL
            await tf.ready();

            console.log("TensorFlow backend in use:", tf.getBackend());

            // Load MoveNet model 
            const detector = await posedetection.createDetector(
                posedetection.SupportedModels.MoveNet,
                {
                    modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                    // Options:
                    // SINGLEPOSE_LIGHTNING = fastest, good for real-time
                    // SINGLEPOSE_THUNDER = more accurate, but slower
                    // MULTIPOSE_LIGHTNING = detects multiple people
                }
            );

            // Access webcam 
            const video = videoRef.current;
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;

            // Wait for the video to be ready - check browser permission
            await new Promise((resolve) => {
                video.onloadedmetadata = () => resolve();
            });
            video.play();

            // Set canvas size to match video
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            // Match canvas size to video resolution (fallback if not available)
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;

            const detect = async () => {
                if (!video.videoWidth) {
                    // Wait for video to initialize
                    requestAnimationFrame(detect);
                    return;
                }
                 // Clear old frame
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                //Run the ML model → get poses
                const poses = await detector.estimatePoses(video);
                //Draw each keypoint (joints)
                poses.forEach((pose) => {
                    pose.keypoints.forEach((kp) => {
                        if (kp.score > 0.4) {
                            ctx.beginPath();
                            ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
                            ctx.fillStyle = "red";
                            ctx.fill();
                        }
                    });
                    // Draw skeleton (connects keypoints)
                    const adjacentPairs = posedetection.util.getAdjacentPairs(
                        posedetection.SupportedModels.MoveNet // returns which joints connect (e.g., shoulder→elbow)
                    );
                    adjacentPairs.forEach(([i, j]) => {
                        const kp1 = pose.keypoints[i];
                        const kp2 = pose.keypoints[j];
                        if (kp1.score > 0.4 && kp2.score > 0.4) {
                            ctx.beginPath();
                            ctx.moveTo(kp1.x, kp1.y); // start line at keypoint1
                            ctx.lineTo(kp2.x, kp2.y);
                            ctx.strokeStyle = "green"; // skeleton = green
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    });
                });
                // Repeat detection on next animation frame 
                requestAnimationFrame(detect);
            };

            detect(); // Start detection loop
        };

        runPoseDetection(); // Kick things off when component mounts
    }, []);

    return (
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            {/* original cam vid */}
            <video
                ref={videoRef}
                style={{ display: "none" }}
                playsInline
                autoPlay
                muted
            />
            {/* canvas for TFJS */}
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: "auto",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                }}
            />
        </div>
    );
}
import React, { useEffect } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";

import Webcam from "./Webcam";

const TensorflowTest = () => {
    useEffect(() => {
        const runModel = async () => {
            const net = await mobilenet.load();
            console.log("✅ Model loaded");

            const video = document.querySelector("video");
            if (video) {
                setInterval(async () => {
                    const predictions = await net.classify(video);
                    console.log("Predictions:", predictions);
                }, 2000);
            }
        };

        runModel();
    }, []);

    return (
        <div>
            <h2>TensorFlow + Webcam Test</h2>
            <Webcam />
        </div>
    );
};

export default TensorflowTest;
import React from "react";
import TensorflowTest from "./TensorFlowTest";
import PoseTracker from "./PoseTracker";

function App() {
  return (
    <div>
      <h1>My Vite + React + TensorFlow App</h1>

      {/* Old MobileNet test */}
      {/* <TensorflowTest /> */}

      <hr />

      {/* Pose detection */}
      <PoseTracker />
    </div>
  );
}

export default App;
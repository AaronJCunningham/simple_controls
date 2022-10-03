import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

import SquarePlayer from "./components/SquarePlayer";
import Box from "./components/Box";

const App = () => {
  return (
    <div className="canvas">
      <Canvas>
        <SquarePlayer />
        <Box />
      </Canvas>
    </div>
  );
};

export default App;

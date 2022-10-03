import { useEffect } from "react";
import * as THREE from "three";

import { useCollider } from "../store";

const Box = (props) => {
  const [collider, setCollider] = useCollider((state) => [
    state.collider,
    state.setCollider,
  ]);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(1, 0, 1);

  useEffect(() => {
    setCollider("test");
  }, [setCollider, collider]);

  return <primitive object={cube} />;
};

export default Box;

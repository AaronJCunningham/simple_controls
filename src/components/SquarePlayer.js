import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import { PerspectiveCamera } from "@react-three/drei";

//state
import { useCollider } from "../store";

//utils
import { characterMovement } from "../gameUtils/characterMovement";

const SquarePlayer = (props) => {
  const character = useRef(null);
  const camera = useRef(null);
  const detect = [];

  const collider = useCollider((state) => state.collider);
  console.log(collider);
  detect.push(collider);

  let forw = false;
  let right = false;
  let backward = false;
  let left = false;
  let _collide = false;

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("keyup", handleKeyUp);
    };
  });

  const handleKeyPress = (event) => {
    switch (event.keyCode) {
      case 87: //w
        console.log("w");
        forw = true;
        break;
      case 65: //a
        left = true;
        break;
      case 83: //s
        backward = true;
        break;
      case 68: // d
        right = true;
        break;
      default:
        break;
    }
  };

  const handleKeyUp = (event) => {
    switch (event.keyCode) {
      case 87: //w
        forw = false;
        break;
      case 65: //a
        left = false;
        break;
      case 83: //s
        backward = false;
        break;
      case 68: // d
        right = false;
        break;
      default:
        break;
    }
  };

  const currentPosition = new THREE.Vector3();
  const currentLookAt = new THREE.Vector3();
  const decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
  const acceleration = new THREE.Vector3(1, 0.125, 10.0); //change speed
  const velocity = new THREE.Vector3(0, 0, 0);

  const calculateIdealOffset = () => {
    const idealOffset = new THREE.Vector3(0, 2, -3);
    idealOffset.applyQuaternion(character.current.quaternion);
    idealOffset.add(character.current.position);
    return idealOffset;
  };

  const calculateIdealLookat = () => {
    const idealLookat = new THREE.Vector3(0, 1, 5);
    idealLookat.applyQuaternion(character.current.quaternion);
    idealLookat.add(character.current.position);
    return idealLookat;
  };

  const updateCameraTarget = (delta) => {
    const idealOffset = calculateIdealOffset();
    const idealLookat = calculateIdealLookat();

    const t = 1.0 - Math.pow(0.001, delta); //pow = power example pow(2,3) = 8

    currentPosition.lerp(idealOffset, t);
    currentLookAt.lerp(idealLookat, t);

    camera.current.position.copy(currentPosition);
  };

  // movement

  let arrow;
  let pos;
  let dir;

  useFrame((state, delta) => {
    characterMovement(
      delta,
      velocity,
      character,
      arrow,
      acceleration,
      collider,
      detect,
      forw,
      backward,
      left,
      right,
      decceleration,
      updateCameraTarget
    );
    const idealLookat = calculateIdealLookat();
    state.camera.lookAt(idealLookat);
    state.camera.updateProjectionMatrix();
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={60} />
      <mesh ref={character}>
        <boxGeometry args={[0.2, 0.2, 0.2]} position={[0, 0.5, 0]} />
        <meshBasicMaterial color="red" transparent={true} opacity={1} />
        {/* <arrowHelper args={[pos, dir, 1, 0xfff]} /> */}
      </mesh>
    </>
  );
};

export default SquarePlayer;

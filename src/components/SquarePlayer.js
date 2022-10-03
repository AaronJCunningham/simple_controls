import { useCallback } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import { PerspectiveCamera } from "@react-three/drei";

import { useCollider } from "../store";

const SquarePlayer = (props) => {
  const character = useRef(null);
  const camera = useRef();

  // const collider = useCollider((state) => state.collider);

  let forw = false;
  let right = false;
  let backward = false;
  let left = false;
  let collide = false;

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("keyup", handleKeyUp);
    };
  });

  const handleKeyPress = useCallback((event) => {
    switch (event.keyCode) {
      case 87: //w
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
    }
  }, []);

  const handleKeyUp = useCallback((event) => {
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
    }
  }, []);

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

  function updateCameraTarget(delta) {
    const idealOffset = calculateIdealOffset();
    const idealLookat = calculateIdealLookat();

    const t = 1.0 - Math.pow(0.001, delta); //pow = power example pow(2,3) = 8

    currentPosition.lerp(idealOffset, t);
    currentLookAt.lerp(idealLookat, t);

    camera.current.position.copy(currentPosition);
  }

  // movement

  const characterState = (delta) => {
    const newVelocity = velocity;
    const frameDecceleration = new THREE.Vector3(
      newVelocity.x * decceleration.x,
      newVelocity.y * decceleration.y,
      newVelocity.z * decceleration.z
    );
    frameDecceleration.multiplyScalar(delta);
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(newVelocity.z));

    newVelocity.add(frameDecceleration);

    const controlObject = character.current;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    //collider logic
    let dir = new THREE.Vector3();
    const pos = character.current.position.clone();
    let raycaster = new THREE.Raycaster(pos, dir);
    let blocked = false;

    const acc = acceleration.clone();

    if (forw) {
      newVelocity.z += acc.z * delta;
    }

    if (backward) {
      newVelocity.z -= acc.z * delta;
    }
    if (left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * delta * acceleration.y);
      _R.multiply(_Q);
    }
    if (right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * delta * acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(newVelocity.x * delta);
    forward.multiplyScalar(newVelocity.z * delta);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    character.current.position.copy(controlObject.position);
    updateCameraTarget(delta);
  };

  useFrame((state, delta) => {
    characterState(delta);
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
      </mesh>
    </>
  );
};

export default SquarePlayer;

import * as THREE from "three";

const decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
const acceleration = new THREE.Vector3(1, 0.125, 10.0); //change speed
const velocity = new THREE.Vector3(0, 0, 0);

export const characterMovement = (
  delta,
  character,
  collider,
  detect,
  forw,
  backward,
  left,
  right,
  updateCameraTarget
) => {
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
  let pos = character.current.position.clone();
  let dir = new THREE.Vector3();
  character.current.getWorldDirection(dir);
  let raycaster = new THREE.Raycaster(pos, dir);

  let blocked = false;

  const acc = acceleration.clone();

  if (collider !== undefined) {
    const intersect = raycaster.intersectObjects(detect);
    // console.log(intersect);
    if (intersect.length > 0) {
      // console.log("worked insidea");
      if (intersect[0].distance < 1) {
        // console.log("worked");
        blocked = true;
      }
    }
  }

  if (forw && !blocked) {
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

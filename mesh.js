import * as THREE from 'three';

const geometry={};
const material={};
const mesh={};
const box={};
const body={};

export function create_mesh(scene,world) {
{
    geometry.me = new THREE.BoxGeometry(1, 1, 1);
    material.me = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    mesh.me = new THREE.Mesh(geometry.me, material.me);
    scene.add(mesh.me);
    box.me = new THREE.Box3();
}
{
    geometry.cube1 = new THREE.BoxGeometry(1, 1, 1);
    material.cube1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    mesh.cube1 = new THREE.Mesh(geometry.cube1, material.cube1);
    scene.add(mesh.cube1);
    box.cube1 = new THREE.Box3();
}
{
    geometry.ball1 = new THREE.SphereGeometry(1);
    material.ball1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    mesh.ball1 = new THREE.Mesh(geometry.cube1, material.cube1);
    scene.add(mesh.ball1);
    box.ball1 = new THREE.Box3();
    body.ball1 = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 10, 0)
    );
    world.createCollider(RAPIER.ColliderDesc.ball(1), body.ball1);
}
{
    geometry.floor1 = new THREE.PlaneGeometry(100, 100);
    material.floor1 = new THREE.MeshStandardMaterial({ color: 0x808080 });
    mesh.floor1 = new THREE.Mesh(geometry.floor1, material.floor1);
    mesh.floor1.rotation.x = -Math.PI / 2;
    mesh.floor1.position.y=-10;
    scene.add(mesh.floor1);
    box.floor1 = new THREE.Box3();
    body.floor1= world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0)
    );
    world.createCollider(RAPIER.ColliderDesc.cuboid(50, 1, 50), body.floor1);
}
}

export{geometry,material,mesh,box,body};
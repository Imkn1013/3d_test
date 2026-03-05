    import * as THREE from 'three';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import RAPIER from "https://cdn.skypack.dev/@dimforge/rapier3d-compat";
    import {geometry,material,mesh,box} from "./mesh"

    async function init() {
      await RAPIER.init();
      const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
      //地面
      const groundBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0)
      );
      world.createCollider(RAPIER.ColliderDesc.cuboid(50, 1, 50), groundBody);

      //ボール
      const ballBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 10, 0)
      );
      world.createCollider(RAPIER.ColliderDesc.ball(1), ballBody); // 半径1

      // 4. 【ループ】
      function update() {
        world.step(); 
        
        // ここで ballBody.translation() を取得して Three.js に渡す
        // ...
        requestAnimationFrame(update);
      }
      update();
    }
    init();

    //scene,camera,renderer定義,光源追加
    const core=function(){
    // --- 1. 儀式（シーン、カメラ、レンダラー） ---
    // ② Scene（儀式・ほぼ固定）
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);//自由

    // ③ Camera（半固定：値は変更可能）
    const camera = new THREE.PerspectiveCamera(
      75, // ← 変更可（視野角）
      window.innerWidth / window.innerHeight, // 半固定
      0.1, // ← 変更可（近クリップ）
      1000 // ← 変更可（遠クリップ）
    );
    camera.position.z = 5; // ← 自由
    
    // ④ Renderer（半固定）
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    //{ antialias: true }は任意？
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
      
      // --- 2. ライト　---
    const ambientLight = new THREE.AmbientLight(0x404040); // 環境光
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 平行光源
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
      
      return { scene, camera, renderer };
    };
    const { scene, camera, renderer } = core();

    //*OBJ読み込み
    const objread=function(){
    const loader = new OBJLoader();
    const newdiv = document.createElement("div");
    newdiv.id = "buttons";
    const input = document.createElement("input");
    input.type = "file";
    input.id = "input";
    input.accept = ".obj";
    newdiv.appendChild(input);
    document.body.appendChild(newdiv);
    document.getElementById('input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      loader.load(url, (object) => {
        // 全てのメッシュにグレーのマテリアルを適用
        object.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
          }
        });
        scene.add(object);
        document.getElementById('buttons').style.display = 'none';
      });
    });
    };
    objread();
    //*/

    //ステータス定義
    const state = {
      yaw: 0,
      pitch: 0,
      mypos: new THREE.Vector3(0,0,10),
      speed:0.5, //移動速度
      perspective:1 //視点人称
    };
    
    //操作ロジック(yaw,pitch,key)
    const keys = {};
    const control=function(){
    document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
    renderer.domElement.addEventListener('click', () =>
      renderer.domElement.requestPointerLock());
      document.addEventListener('mousemove', e => {
        if (document.pointerLockElement === renderer.domElement) {
          state.yaw -= e.movementX * 0.002;
          state.pitch -= e.movementY * 0.002;
          state.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, state.pitch));
        }
    });
    };
    control();
    
    //その他フレーム処理
    const animation=function(){
      mesh.cube1.rotation.x += 0.01;
      mesh.cube1.rotation.y += 0.01;
    };

    //移動計算
    const moving=function(){
      // 移動計算
      const p = (keys['w'] ? 1 : 0) - (keys['s'] ? 1 : 0);
      const q = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
      
      const move = new THREE.Vector3(q, 0, -p).normalize().multiplyScalar(state.speed);
      move.applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);
      state.mypos.add(move);
      
      const preme=mesh.me.position.clone();
      
      // 移動、カメラへの反映
      if(state.perspective==1){
        mesh.me.position.copy(state.mypos);
        mesh.me.rotation.set(state.pitch, state.yaw, 0);
        camera.position.copy(state.mypos);
        camera.rotation.order = 'YXZ';
        camera.rotation.set(state.pitch, state.yaw, 0);
      }
      else if(state.perspective==3){
        const inverted = state.mypos.clone().multiplyScalar(-1);
        mesh.me.position.copy(inverted);
        mesh.me.rotation.order = 'YXZ';
        mesh.me.rotation.set(state.pitch*(-1), state.yaw, 0);
        mesh.me.add(camera);
        camera.position.set(0, 3, -10);
        camera.lookAt(mesh.me.position);
      }
      
      box.me.setFromObject(mesh.me);
      Object.keys(box).forEach(function (i) {
        if(i=="me"){
          return;
        }
        box[i].setFromObject(mesh[i]);
        if (box.me.intersectsBox(box[i])) {
          console.log("衝突！");
        }
      });
      
    };
    
    //アニメーションループ
    const animate=function() {
      requestAnimationFrame(animate);
      animation();
      moving();
      renderer.render(scene, camera);//固定
    }
    animate();

    //リサイズ
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
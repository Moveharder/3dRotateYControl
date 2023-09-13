<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { reactive, ref, onMounted } from "vue";
import {
  initPerspectiveCamera,
  initRenderer,
  initScene,
} from "./assets/js/initTHREE";
import { createRoundedBadge } from "./assets/js/createBadge";
import { addLights } from "./assets/js/addLights";
// import RotateControl  from "3d-rotater-y";
import { RotateControl } from "./assets/js/rotateControl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import Stats from "three/examples/jsm/libs/stats.module";

import {
  MeshLambertMaterial,
  LineBasicMaterial,
  MeshPhongMaterial,
  MeshBasicMaterial,
  ShapeGeometry,
  DoubleSide,
  Mesh,
} from "three";

const rotateRad = 4 * Math.PI; //旋转动画圈数
let info = reactive({
  rad: "-",
  speed: "-",
  positiveRad: "-",
  startRad: "",
  endRad: "",
});

let loading = ref(true);
let loadingMsg = ref("Loading...");
let scene = initScene(true);
let camera = null;
let renderer = null;
let stats = null;
let rotateCtrl = null; //旋转动画控制器
let keepW7BadgeMesh = null;
let diyBadgeMesh = createRoundedBadge(); //自定义[立方体+贴纸]模拟的勋章
let textMesh = null;
let pX = -20;

let loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
loader.load(
  "models/w7_cc.glb",
  (glb) => {
    keepW7BadgeMesh = glb.scene;
    keepW7BadgeMesh.scale.set(400, 400, 400);//keep-badge-size
    scene.add(keepW7BadgeMesh);
  },
  (xhr) => {
    if (xhr.loaded) {
      let loaded = xhr.loaded / (xhr.total || 5245260);
      loadingMsg.value = `${loaded * 100}% loaded`;
    }
  },
  (e) => {
    console.error("啊出错了!!", e);
  }
);

// 给勋章背面增加获取日期
function addTextGeometry() {
  var loader = new FontLoader();

  loader.load("fonts/font.json", function (font) {
    const color = 0xdaa520;
    const height = 1,
      size = 1,
      curveSegments = 4,
      bevelThickness = 1,
      bevelSize = 1.5,
      bevelEnabled = false;

    const matLite = new MeshBasicMaterial({
      color: color,
      transparent: false,
      opacity: 1, //transparent:true时有效
      side: DoubleSide,
    });

    const message = " BELIEVER\n2022.06.24";
    const shapes = font.generateShapes(message, 0.8);
    const geometry = new ShapeGeometry(shapes);

    geometry.computeBoundingBox();
    const xMid =
      -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

    geometry.translate(xMid, 2.5, 0.7);
    textMesh = new Mesh(geometry, matLite);
    textMesh.rotation.y = Math.PI; //因为要贴在3D徽章背面，所以先旋转180度
    // textMesh.position.z = -3;
    scene.add(textMesh);
    return;

    //文字二
    let textGeo = new TextGeometry(message, {
      font: font,

      size: size,
      height: height,
      curveSegments: curveSegments,

      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
    });

    let materials = [
      new MeshPhongMaterial({ color: 0x000000 }), // front
    ];

    textGeo.computeBoundingBox();

    const centerOffset =
      -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

    textGeo.translate(centerOffset, -3, 1);

    textMesh = new Mesh(textGeo, materials);
    textMesh.rotation.y = Math.PI;
    textMesh.position.z = 0;

    scene.add(textMesh);
  });
}

function addStat() {
  stats = new Stats();
  stats.domElement.style.position = "fixed"; //绝对坐标
  stats.domElement.style.left = "0px"; // (0,0)px,左上角
  stats.domElement.style.top = "calc(100% - 50px)";
  document.documentElement.appendChild(stats.dom);
}

function resetRotation() {
  rotateCtrl && rotateCtrl.reset();
}

addStat();
function animate() {
  requestAnimationFrame(animate);
  if (keepW7BadgeMesh && loading.value) {
    // 打开位移动画
    pX += 0.33;
    keepW7BadgeMesh.position.set(pX, 0, 0);

    // 打开旋转动画
    if (keepW7BadgeMesh.rotation.y < rotateRad) {
      keepW7BadgeMesh.rotation.y += 0.22;
    } else if (keepW7BadgeMesh.rotation.y != rotateRad) {
      //结束loading动画，重置旋转角度，否则会影响 [rotateCtrl]内的旋转逻辑
      loading.value = false;
      keepW7BadgeMesh.rotation.y = 0;
      keepW7BadgeMesh.position.set(0, 0, 0);
      addTextGeometry();
    }
  }

  stats && stats.update();
  renderer.render(scene, camera);
}

onMounted(() => {
  let targetDom = document.querySelector("#object");
  camera = initPerspectiveCamera({ root: targetDom });
  renderer = initRenderer({ root: targetDom });
  renderer.physicallyCorrectLights = true;
  renderer.setPixelRatio(window.devicePixelRatio);

  addLights(scene, diyBadgeMesh);
  camera.position.set(0, 0, 30); // 设置相机的位置
  camera.lookAt(0, 0, 0); // 相机看向原点

  // 监听勋章水平转动操作
  rotateCtrl = new RotateControl(targetDom);
  rotateCtrl.listen();
  rotateCtrl.on("update", ({ rad, positiveRad, speed, startRad, endRad }) => {
    diyBadgeMesh.rotation.y = -rad;
    keepW7BadgeMesh.rotation.y = rad;
    textMesh.rotation.y = rad + Math.PI;
    info.rad = rad;
    info.speed = speed;
    info.positiveRad = positiveRad;
    info.startRad = startRad;
    info.endRad = endRad;
  });

  animate();
});
</script>

<template>
  <div class="rtrad loading" v-if="loading">{{ loadingMsg }}</div>
  <div class="rtrad" v-else>
    curRad: {{ info.rad }}<br />leftRad: {{ info.positiveRad }}<br />speed:
    {{ info.speed }}
    <div v-if="info.startRad">
      from: {{ info.startRad }} <br />to: {{ info.endRad }}
    </div>
  </div>
  <div class="resetbtn" @click="resetRotation">RESET</div>

  <div id="object"></div>
</template>

<style>
:root {
  --primary-color: purple;
  user-select: none;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#object {
  border: dashed 2px #ccc;
  box-sizing: border-box;
  height: 100vh;
  width: 100vw;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

body {
  overflow: hidden;
  padding: 0;
  margin: 0;
  cursor: grab;
}

.rtrad {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  font-size: 1.5rem;
  padding: 10px;
  line-height: 1em;
  z-index: 3;
  color: var(--primary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resetbtn {
  position: fixed;
  font-size: 2rem;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  border: solid 10px coral;
  padding: 5px 10px;
  box-sizing: border-box;
  z-index: 999;
  color: #fff;
  background-color: #ccc;
}
</style>

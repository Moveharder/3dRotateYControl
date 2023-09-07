> 以下是逐步优化 threejs 开发的过程！

## 用 npm 的方式引入 threejs

```js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
```

## 随便写一个 threejs 基类

```js
// base3d.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
export class Base3d {
  width = window.innerWidth;
  height = window.innerHeight;

  loadingProcess = 0;
  sceneReady = false;

  containerSelector = null;
  container = null;
  scene = null;
  camera = null;
  renderer = null;
  controls = null;
  ground = null; //地板mesh
  stats = null;

  clock = new THREE.Clock();
  oldElapsedTime = 0;

  publicPath = {
    // model:'models/',
    model: "https://static.fatiaoya.com/front/believer/resources/models/",
    hdr: "hdr/",
    image: "images/",
    texture: "images/texture/",
    sound: "sounds/",
  };

  constructor(containerSelector) {
    this.containerSelector = containerSelector;
    this.initTHREE();

    window.onerror = (error) => {
      console.error(error);
    };
  }

  initTHREE() {
    // 创建场景
    const scene = new THREE.Scene();

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 0, 0);

    // 创建渲染器
    const renderer = new THREE.WebGL1Renderer({
      antialias: true,
      logarithmicDepthBuffer: true, // 设置对数缓冲区，解决多模型交合处闪烁（多面渲染不知道应该渲染哪个面）
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setClearColor("#e4e4ea");
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;
    // renderer.outputEncoding = THREE.sRGBEncoding; //色彩饱和度高一点
    // renderer.useLegacyLights = false;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping; //电影渲染效果
    // renderer.toneMappingExposure = 1;

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // 创建灯光
    this.createLight();

    // 性能监测
    this.initStats();
  }

  /**添加轨道控制器 */
  createOrbitControls() {
    let controls = new OrbitControls(this.camera, this.container);
    controls.enableDamping = true;
    controls.minDistance = 0.01; //相机跟随距离
    this.controls = controls;
  }

  createLight() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);

    // 直射光
    const moonLight = new THREE.DirectionalLight("#ffffff", 1.5);
    moonLight.position.set(-5, 20, 10);
    moonLight.castShadow = true;
    this.scene.add(moonLight);
  }

  addHelpers() {
    this.createAxesHelper();
    this.createGridHelper();
  }

  /**添加辅助线 */
  createAxesHelper(size = 1000) {
    this.scene.add(new THREE.AxesHelper(size));
  }

  /**添加网格 */
  createGridHelper(size = 320, divisions = 32, color1, color2) {
    this.scene.add(new THREE.GridHelper(size, divisions));
  }

  createObject() {
    console.log("base3d createobj");
  }

  createLoadingManager() {
    const manager = new THREE.LoadingManager();
    manager.onProgress = async (url, loaded, total) => {
      if (Math.floor((loaded / total) * 100) === 100) {
        this.loadingProcess = Math.floor((loaded / total) * 100);
        this.sceneReady = true;
      } else {
        this.loadingProcess = Math.floor((loaded / total) * 100);
      }
    };
    this.loadingManager = manager;
  }

  /* 性能插件 */
  initStats() {
    this.stats = new Stats();
    this.stats.domElement.style.position = "absolute"; //绝对坐标
    this.stats.domElement.style.left = "0px"; // (0,0)px,左上角
    this.stats.domElement.style.top = "0px";
    document.body.appendChild(this.stats.domElement);
  }

  /**页面缩放监听并重新更新场景和相机 */
  onResize() {
    window.addEventListener("resize", () => {
      // 修改相机的参数，宽高比
      this.camera.aspect = window.innerWidth / window.innerHeight;
      // 更新投影的变换矩阵
      this.camera.updateProjectionMatrix();
      // 重新设置渲染器尺寸
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  animate() {
    const { scene, camera, renderer, clock, oldElapsedTime } = this;
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    this.oldElapsedTime = elapsedTime;

    if (this.stats) {
      this.stats.update();
    }

    // 更新子类中需要高速渲染的内容
    this.update && this.update(elapsedTime, deltaTime);

    // 更新控制器
    this.controls && this.controls.update(); //会影响相机的位置(在visit2023中遇到的问题，转向问题)

    renderer.render(scene, camera);
    window.requestAnimationFrame(this.animate.bind(this));
  }

  onMounted() {
    this.container = document.querySelector(this.containerSelector);
    this.container.appendChild(this.renderer.domElement);

    // 调用子类中的初始化函数(依赖dom挂载状态)
    this.init && this.init();

    this.onResize();

    this.animate();
  }

  onUnmounted() {
    console.log("unmounted.");
    this.hide && this.hide();
  }
}
```

## 开始开发 threejs 功能

```js
<template>
    <div class="container" ref="container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue"
import { Base3d } from './src/base3d.js'

const game = new Base3d('.container')
let container = ref(null)

// !!!OrbitControl会干Vue里的扰点击事件

onMounted(() => {
    game.onMounted()
})

onUnmounted(() => {
    game.onUnmounted()
})

</script>
<style lang="less" scoped>
.container {
    width: 100vw;
    height: 100vh;
}
</style>
```

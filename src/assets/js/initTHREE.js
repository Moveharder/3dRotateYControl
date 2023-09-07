import {
  PerspectiveCamera,
  WebGLRenderer,
  Scene,
  AxesHelper,
  GridHelper,
  Color,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// 透视相机
export function initPerspectiveCamera({
  fov = 75,
  near = 0.1,
  far = 1000,
  root = window,
}) {
  let W = root.innerWidth || root.clientWidth;
  let H = root.innerHeight || root.clientHeight;
  let aspect = W / H;
  let camera = new PerspectiveCamera(fov, aspect, near, far); //透视相机
  // camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  return camera;
}


// 正交相机
export function initOrthographicCamera({
  near = 0.1,
  far = 1000,
  root = window,
}) {
  let W = root.innerWidth || root.clientWidth;
  let H = root.innerHeight || root.clientHeight;
  let camera = new OrthographicCamera(W / -2, W / 2, H / 2, H / -2, near, far); //透视相机
  camera.lookAt(0, 0, 0);
  return camera;
}


export function initRenderer({ root = document.body }) {
  let renderer = new WebGLRenderer({ antialias: true });

  // 开启阴影
  //   renderer.shadowMap.enabled = true;
  //   renderer.shadowMap.type = PCFSoftShadowMap;

  let W = root.innerWidth || root.clientWidth;
  let H = root.innerHeight || root.clientHeight;
  renderer.setSize(W, H);
  root.appendChild(renderer.domElement);
  renderer.setClearColor(0xcccccc, 1.0);

  return renderer;
}

export function initScene(needGridHelper = false, AxesHelper = false) {
  let scene = new Scene();
  if (needGridHelper) {
    let helper = initGrid();
    scene.add(helper);
  }
  if (AxesHelper) {
    scene.add(new AxesHelper(10)); // 添加坐标轴辅助线
  }
  scene.background = new Color(0xffffff);
  return scene;
}

export function initControls(camera, rendererDomElement) {
  let controls = new OrbitControls(camera, rendererDomElement);
  controls.target.set(0, 2, 0);
  controls.enableDamping = true; // 惯性
  controls.dampingFactor = 0.08; //动态阻尼系数
  controls.enablePan = false; // 禁用(左右)平移
  controls.enableZoom = true; // 启用缩放
  // controls.autoRotate = true; //自动旋转
  // controls.autoRotateSpeed = 0.2; //自动旋转速度，正比
  controls.minPolarAngle = Math.PI / 2; // 垂直旋转角度限制
  controls.maxPolarAngle = Math.PI / 2;
  // controls.rotateSpeed = 0.2; //减小默认旋转速度
  return controls;
}

function initGrid() {
  const size = 1000;
  const divisions = 100;
  const gridHelper = new GridHelper(size, divisions, 0x444444, 0x808080);
  gridHelper.position.y = -100;
  gridHelper.position.x = 0;
  return gridHelper;
}

import {
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  RectAreaLight,
  SpotLight,
} from "three";

export function addLights(scene, target) {
  let ambientLight = new AmbientLight(0xffffff);
  scene.add(ambientLight);

  let intensity = 5;

  //创建一个平行光
  let DirLight = new DirectionalLight(0xffffff, intensity);
  DirLight.position.set(0, 0, 300);
  DirLight.target = target;
  scene.add(DirLight);

  let DirLight2 = new DirectionalLight(0xffffff, intensity);
  DirLight2.position.set(0, 0, -10);
  DirLight2.target = target;
  scene.add(DirLight2);

  // // 创建一个平面光源
  // let light = new RectAreaLight(0xffffff, intensity, 1000, 1000);
  // light.position.set(0, 0, 900); //设置光源位置
  // light.target = target;
  // scene.add(light);

  // let light2 = new RectAreaLight(0xffffff, intensity, 1000, 1000);
  // light2.position.set(0, 0, -900); //设置光源位置
  // light2.target = target;
  // scene.add(light2);
}

import { Mesh, TextureLoader, MeshPhysicalMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import normalMapFront from "../img/normalMap_front.png";
import front from "../img/front.png";
import normalMapBack from "../img/normalMap_back.png";
import back from "../img/back.jpg";
import metal from "../img/metal.png";

export function createRoundedBadge() {
  //徽章模型-本体
  let badgeMesh = null;

  //徽章模型-正面
  let segmentMap = new MeshPhysicalMaterial({
    normalMap: new TextureLoader().load(normalMapFront),
    map: new TextureLoader().load(front),
  });

  //徽章模型-背面
  let segmentMapBack = new MeshPhysicalMaterial({
    normalMap: new TextureLoader().load(normalMapBack),
    map: new TextureLoader().load(back),
  });

  //徽章模型-四周
  let metalMap = new MeshPhysicalMaterial({
    map: new TextureLoader().load(metal),
  });

  // 徽章-组合纹理数组
  const boxMaps = [
    metalMap,
    metalMap,
    metalMap,
    metalMap,
    segmentMap,
    segmentMapBack,
  ];

  // 💡 立方体长宽高比例需要和贴图的大小比例一致，厚度可以随便定
  let boxGeometry = new RoundedBoxGeometry(180, 180, 12, 10, 40); //圆角立方体(需要引入RoundedBoxGeometry.js库)
  badgeMesh = new Mesh(boxGeometry, boxMaps);
  badgeMesh.material.map((item) => {
    // 材质样式调整
    item.metalness = 0.5;
    item.roughness = 0.4;
    item.refractionRatio = 1;
    return item;
  });
  badgeMesh.scale.set(0.05, 0.05, 0.05);
  badgeMesh.position.set(0, 10, 0);
  badgeMesh.rotation.x = 0.1;
  // badgeMesh.castShadow = true; //阴影

  return badgeMesh;
}

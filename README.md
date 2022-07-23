# 3dRotateYControl

# Features

- 动画更新基于`requestAnimationFrame`
- 仅支持Y轴方向旋转控制；
- 需要附带“根据不同范围内的旋转角度，能够自动过渡到水平位置”的惯性/重力感旋转效果；(从平面视角来看，需要达到\[0,90)，松手后回到 0 弧度位置；(90,180\]，松手后回到 PI 弧度位置的旋转过度效果）
- 同时支持 PC 和移动端；
- 从指定角度开始归零的旋转过渡动画；
- 支持初始化时制定任意展示角度；
- 点击/双击回到初始角度；


# Usage
import rotateCtrl from "3dRotateYControl";

let targetDom = document.querySelector("#badge_stage");
let rotateCtrl = new RotateControl(targetDom);
let isTouching = false;
// 添加监听事件，目前只有一个`update`事件可供监听，并在回调内更新「徽章badgeMesh.rotation.y」
rotateCtrl.on(
  "update",
  ({ rad, onTouch, positiveRad, speed, startRad, endRad }) => {
    isTouching = onTouch;
    badgeMesh && (badgeMesh.rotation.y = rad);
  }
);

// 开始监听旋转控制返回的数据
rotateCtrl.listen();

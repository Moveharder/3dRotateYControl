# 3dRotateYControl

# Features

- 🚀 动画更新基于`requestAnimationFrame`
- 🧭 仅支持Y轴方向旋转控制；
- 🪆 需要附带“根据不同范围内的旋转角度，能够自动过渡到水平位置”的惯性/重力感旋转效果；(从平面视角来看，需要达到\[0,90)，松手后回到 0 弧度位置；(90,180\]，松手后回到 PI 弧度位置的旋转过度效果）
- 👬 同时支持 PC 和移动端；
- 从指定角度开始归零的旋转过渡动画；
- 支持初始化时制定任意展示角度；
- 点击/双击回到初始角度；


# Usage
#### basic
```
import rotateCtrl from "3dRotateYControl";

/**
* RotateControl(targetDom, targetRadius);
* targetDom 需要控制的元素
* targetRadius 目标元素的半径（宽度的一半，影响手指或鼠标滑动元素时的敏感度），默认200px
*/

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
```
  
#### Advance
```
/**
* rotateCtrl.reset(duration, resetRad);
* duration 过渡时间ms，默认500
* resetRad 制定重置的角度，默认0
*/

// 比如想在1000ms里，从PI开始重置到0，可以这么用！
rotateCtrl.reset(0, PI);
rotateCtrl.reset(1000, 0);
```


#### Todos
- 模拟Apple Watch徽章松手后的***摆动->停止***的过渡效果
- 完成`freezePage`函数：手指/鼠标控制目标元素转动时，禁止页面scrollY
- 删除`playAmt`函数：第一个版本，能够实现小摆动，但是停住的时机不够精准；



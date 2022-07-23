const DIR_LEFT = "left"; //向左滑动
const DIR_RIGHT = "right"; //向右滑动
const DIR_IDEL = "idel"; //静止
const PI = Math.PI;
export class RotateControl {
  constructor(targetDom, objectRadius = 200) {
    this.dom = targetDom;
    this.radius = objectRadius;
    this.isMoving = false; //[鼠标/手指]是否在拖动
    this.isPlaying = false; //是否在播放惯性动画
    this.controlDir = DIR_IDEL; //[鼠标/手指]初始水平拖动方向
    this.startX = null; //[鼠标/手指]初始点击位置
    this.startTime = null; //[鼠标/手指]初始点击时间
    this.rad = 0; //旋转弧度
    this.positiveRad = 0; //旋转弧度
    this.round = 0; //圈数
    this.speed = 1; //[鼠标/手指]移动速度
    this.againstForce = 0.0009; //摩擦力，速度衰减系数
    this.stopPlayingRate = 0.084; //当旋转角度在这个范围内时，执行物体复位(+-5deg)
    this.frameRate = 16.67; //默认帧率ms

    this.events = {}; //回调事件列表
  }

  get test() {
    alert(1);
  }

  listen() {
    let self = this;

    // 开始触摸
    const onStartHandler = function (evt) {
      self.startX = evt.clientX || evt.targetTouches[0].clientX;
      self.startTime = +new Date();
      self.isPlaying = false;
      self.isMoving = true;
    };

    // 触摸中
    const onMovingHandler = function (evt) {
      if (!self.isMoving) {
        return;
      }
      //todo禁用页面滚动

      let curX = evt.clientX || evt.targetTouches[0].clientX;
      let diffX = self.startX - curX; //水平位移
      self.startX = curX;

      // 根据位移变化，计算当前操作方向
      if (diffX < 0) {
        self.controlDir = DIR_RIGHT;
      } else if (diffX == 0) {
        self.controlDir = DIR_IDEL;
      } else {
        self.controlDir = DIR_LEFT;
      }

      // 根据位移变化，计算应该旋转的角度(sin)
      let curRad = (diffX / self.radius) * 3; //放大一定倍数，更容易转动
      self.rad -= curRad; //默认往左滑(diffX为负)，顺时针(角度为负)，减变化量

      // 根据位移变化，计算[平均]速度 【可能没必要，直接指定一个初始速度speed=1，然后以此值衰减】
      let curTime = +new Date();
      let diffTime = curTime - self.startTime;
      // self.speed = diffX / diffTime;

      // 根据rad，计算旋转了几周
      self.round = Math.floor(Math.abs(self.rad) / (2 * PI));

      self.emit("update", {
        rad: self.rad,
        speed: self.speed,
        onTouch: self.isMoving,
      });
    };

    // 触摸结束
    const onStopHandler = function () {
      //todo重新开启页面滚动

      self.isMoving = false;
      self.isPlaying = true;

      //惯性动画1
      // self.playAmt();

      //惯性动画2
      self.keepBalance();
    };

    /**pc端 */
    this.dom.addEventListener("mousedown", onStartHandler);
    this.dom.addEventListener("mousemove", onMovingHandler);
    this.dom.addEventListener("mouseup", onStopHandler);
    this.dom.addEventListener("dblclick", (evt) => {
      self.reset();
    });

    /**移动端 */
    let isMobile = !!navigator.userAgent.match(/AppleWebKit.*Mobile.*/);
    this.dom.addEventListener("touchstart", onStartHandler);
    this.dom.addEventListener("touchmove", onMovingHandler);
    this.dom.addEventListener("touchend", onStopHandler);
    if (isMobile && !this.isMoving) {
      this.dom.addEventListener("click", (evt) => {
        self.reset();
      });
    }
  }

  freezePage(canScroll = true) {
    if (canScroll) {
      // document.querySelector(".page").style.overflowY = "scroll";
      // document.querySelector(".page").style.height = "auto";
    } else {
      // document.querySelector(".page").style.overflowY = "hidden";
      // document.querySelector(".page").style.height = "100vh";
    }
  }

  on(name, fn) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name].push(fn);
  }

  emit(name, data = {}) {
    let tasks = this.events[name];
    tasks &&
      tasks.length &&
      tasks.map((task) => {
        task && task(data);
      });
  }

  playAmt() {
    let self = this;
    let lastTime = null;
    let playRate = self.frameRate;

    const update = function () {
      //根据当前rad判断惯性动画播放方式[方向、速度]
      if (self.isPlaying) {
        let now = +new Date();
        // if (!lastTime) {
        //   lastTime = now;
        // } else {
        //   playRate = now - lastTime;
        //   lastTime = now;
        // }
        // console.log("calc playRate:", playRate);

        // self.speed *= Math.pow(0.92, playRate / self.frameRate);

        let leftRad = self.rad % Math.PI;
        self.positiveRad = leftRad < 0 ? leftRad + Math.PI : leftRad;

        if (self.positiveRad >= 0 && self.positiveRad < PI / 2) {
          self.speed += self.againstForce * 1.1;
          // self.speed += 0.01745329;
          let deltaRad = (self.speed * playRate) / self.radius;
          self.rad -= deltaRad;
        } else if (self.positiveRad >= PI / 2 && self.positiveRad < PI) {
          self.speed -= self.againstForce * 1.1;
          // self.speed -= 0.01745329;
          let deltaRad = (self.speed * playRate) / self.radius;
          self.rad += deltaRad;
        }

        console.log(
          "leftRad, self.positiveRad, self.speed:",
          leftRad,
          self.positiveRad,
          self.speed
        );

        if (
          self.positiveRad <= self.stopPlayingRate ||
          self.speed < self.againstForce
        ) {
          self.isPlaying = false;
          self.speed = 1;
          self.emit("update", {
            rad: self.rad,
            speed: self.speed,
            positiveRad: self.positiveRad,
            onTouch: self.isMoving,
          });
          return;
        }

        self.emit("update", {
          rad: self.rad,
          speed: self.speed,
          onTouch: self.isMoving,
        });
        requestAnimationFrame(update);
      }
    };

    update();
  }

  /**
   * 通过将面向用户的一面分成(0,PI/2]和[PI/2,PI),
   * 计算出需要过渡的弧度值，调用frame方法逐帧过渡。
   */
  keepBalance() {
    let self = this;
    let leftRad = self.rad % PI; //正、负
    let absLefeRad = Math.abs(leftRad); //用于判断没转过90度的话，回到0，否则转到n倍的+，-PI

    //确定保持平衡时的转动方向「顺时针or逆时针」
    if (absLefeRad > 0 && absLefeRad < PI / 2) {
      self.frame(leftRad, -1); //减少leftRad弧度值
    } else if (absLefeRad >= PI / 2 && absLefeRad < PI) {
      let addRad = 0;
      if (leftRad >= 0) {
        addRad = PI - leftRad;
      } else {
        addRad = absLefeRad - PI;
      }
      self.frame(addRad, 1); //增加addRad弧度值
    }
  }

  /**
   * 帧动画
   * @param {*} s 有正/负方向的弧度值
   * @param {*} direction 方向标识+/-
   * @param {*} duration 过度时间
   */
  frame(s, direction, duration = 300) {
    // test-直接到达结束的弧度
    // this.rad = this.rad + s * direction;
    // this.emit("update", { rad: this.rad, speed: this.speed });
    // return;

    // 缓动过度到结束的弧度
    let self = this;
    let v = s / duration;
    let stepRad = direction * v * self.frameRate;
    let balanceRadRange = [-Math.abs(stepRad), Math.abs(stepRad)]; //平衡误差范围
    let startRad = this.rad;
    let endRad = startRad + s * direction;

    let play = () => {
      self.speed = stepRad;
      self.rad += stepRad;
      let leftRad = self.rad % PI;
      //因为速度方向有正负
      if (leftRad >= balanceRadRange[0] && leftRad <= balanceRadRange[1]) {
        self.rad = endRad; // 最终修订（!!!这里可以做小摆动处理）
        cancelAnimationFrame(play);
      } else {
        !self.isMoving && requestAnimationFrame(play);
      }

      self.emit("update", {
        rad: self.rad,
        speed: self.speed,
        onTouch: self.isMoving,
        positiveRad: leftRad,
        startRad,
        endRad,
      });
    };

    play();
  }

  /**
   * 还原rotation.y到指定的弧度值
   * @param {Number} duration ms
   * @param {Number} resetRad 结束角度
   */
  reset(duration = 500, resetRad = 0) {
    let self = this;
    let leftRad = 0;
    let startRad = self.rad;
    if (Math.abs(self.rad) > PI) {
      leftRad = self.rad % PI;
    }
    let s = self.rad - leftRad - resetRad; //距离：当前弧度减去余数（PI的整数倍），再减去终止弧度
    let v = s / duration; //速度：每毫秒变化的弧度值
    let stepRad = v * self.frameRate; //步频：乘以帧率系数则为每一次刷新+-的变化量
    let stopRadRange = [-Math.abs(stepRad), Math.abs(stepRad)];

    let doReset = () => {
      self.rad -= stepRad;
      let curRad = self.rad;
      //因为速度方向有正负
      if (curRad >= stopRadRange[0] && curRad <= stopRadRange[1]) {
        self.rad = resetRad;
        cancelAnimationFrame(doReset);
      } else {
        !self.isMoving && requestAnimationFrame(doReset);
      }
      self.emit("update", {
        rad: self.rad,
        speed: self.speed,
        onTouch: self.isMoving,
        startRad,
        endRad: resetRad,
      });
    };

    doReset();
  }
}

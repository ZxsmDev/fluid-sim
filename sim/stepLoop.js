export default class StepLoop {
  constructor(sim) {
    this.sim = sim;
    this.currentStep = 0;
    this.steps = 0;
    this.lastTime = 0;
    this.lastLoop = performance.now();
    this.frameCount = 0;
    this.fps = 0;
  }
  start() {
    document.querySelector("input").addEventListener("change", (e) => {
      this.steps++;
      this.currentStep = e.target.value;
      this.sim.step = this.currentStep;
      console.log(
        `Looping: ${this.sim.params.loop}, Current Step: ${this.sim.params.step}, Total Steps: ${this.steps}`
      );
    });
  }
  startLoop() {
    if (!this._frameId) {
      this._frameId = requestAnimationFrame(this.loop.bind(this));
    }
  }
  stopLoop() {
    if (this._frameId) {
      cancelAnimationFrame(this._frameId);
      this._frameId = null;
      this.lastTime = 0;
      this.sim.ctx.clearRect(0, 0, this.sim.width, this.sim.height);
    }
  }
  loop(time) {
    if (!this.lastTime) this.lastTime = time;

    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.sim.resizeCanvas();
    this.sim.ctx.clearRect(0, 0, this.sim.width, this.sim.height);

    this.frameCount++;
    if (time - this.lastLoop >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastLoop = time;
    }

    this.sim.ctx.fillStyle = "white";
    this.sim.ctx.font = "16px Courier New";
    this.sim.ctx.fillText(`FPS: ${this.fps}`, this.sim.width - 130, 20);
    this.sim.ctx.fillText(
      `Delta: ${delta.toFixed(3)}`,
      this.sim.width - 130,
      40
    );

    this.sim.pool.update(delta);
    this.sim.pool.render();

    this._frameId = requestAnimationFrame(this.loop.bind(this));
  }
}

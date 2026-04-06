import SimStep from "./stepLoop.js";
import Pool from "./pool.js";

export default class SimManager {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;

    this.step = 0;
    this.steps = new SimStep(this);

    this.params = {};
    this.updateParams();

    document.querySelectorAll("input").forEach((element) => {
      if (element.type !== "checkbox") {
        this.params[element.name] = element.value;
      } else {
        this.params[element.name] = element.checked;
      }
    });

    this.resizeCanvas();
    this.bounds = [
      { x: 10, y: 50 }, // Top Left
      { x: this.width - 10, y: 50 }, // Top Right
      { x: this.width - 10, y: this.height - 10 }, // Bottom Right
      { x: 10, y: this.height - 10 }, // Bottom Left
    ];

    this.poolSize = this.params["count"] || 10;
    this.particleSize = this.params["size"] || 25;
    this.particleRadius = this.particleSize / 2;
    this.smoothingRadius;
    this.targetDensity;
    this.pressureMultiplier;
    this.pool = new Pool(this, this.poolSize);
  }
  init() {
    this.steps.start();
    if (this.params.loop) {
      this.steps.startLoop();
    } else {
      this.steps.stopLoop();
    }
  }
  updateParams() {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((element) => {
      element.addEventListener("change", (e) => {
        if (element.type !== "checkbox") {
          this.params[element.name] = e.target.value;
        } else {
          this.params[element.name] = element.checked;

          if (element.name === "loop") {
            if (this.params.loop) {
              this.steps.startLoop();
            } else {
              this.steps.stopLoop();
            }
          }
        }
        if (typeof this.params !== "undefined") {
          // Update dependent properties
          this.pool.poolSize = this.params["count"] || 10;
          this.pool.particleSize = this.params["size"] || 25;
          this.pool.particleRadius = this.particleSize / 2;
          this.pool.smoothingRadius;
          this.pool.targetDensity;
          this.pool.pressureMultiplier;
          console.log(this.params);
        }
      });
    });
  }
  resizeCanvas() {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    if (
      this.canvas.width !== displayWidth ||
      this.canvas.height !== displayHeight
    ) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;

      this.width = this.canvas.width;
      this.height = this.canvas.height;

      this.bounds = [
        { x: 10, y: 50 }, // Top Left
        { x: this.width - 10, y: 50 }, // Top Right
        { x: this.width - 10, y: this.height - 10 }, // Bottom Right
        { x: 10, y: this.height - 10 }, // Bottom Left
      ];
    }
  }
}

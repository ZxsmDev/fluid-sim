import SimStep from "./simStep.js";

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
  }
  init() {
    this.steps.start();
    if (this.params.loop) {
      this.steps.startLoop();
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
        console.log(this.params);
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
    }
  }
}

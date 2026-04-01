import SimStep from "./simStep.js";
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

    this.particleSize = this.params["size"] || 25;
    this.particleRadius = this.particleSize / 2;
    this.poolSize = this.params["count"] || 10;
    this.pool = new Pool(this, this.poolSize);

    this.damping = 1;
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

      this.bounds = [
        { x: 10, y: 50 }, // Top Left
        { x: this.width - 10, y: 50 }, // Top Right
        { x: this.width - 10, y: this.height - 10 }, // Bottom Right
        { x: 10, y: this.height - 10 }, // Bottom Left
      ];
    }
  }
  boundaries(dt) {
    // Draw
    this.ctx.strokeStyle = "green";
    this.ctx.beginPath();
    this.ctx.moveTo(this.bounds[3].x, this.bounds[3].y);
    for (let i in this.bounds) {
      this.ctx.lineTo(this.bounds[i].x, this.bounds[i].y);
    }
    this.ctx.stroke();

    this.pool.particles.forEach((particle) => {
      // Run Collision
      if (particle.pos.x - particle.size.radius < this.bounds[0].x) {
        particle.pos.x = this.bounds[0].x + particle.size.radius;
        particle.velocity.x *= -this.damping;
      }
      if (particle.pos.y - particle.size.radius < this.bounds[0].y) {
        particle.pos.y = this.bounds[0].y + particle.size.radius;
        particle.velocity.y *= -this.damping;
      }
      if (particle.pos.x + particle.size.radius > this.bounds[2].x) {
        particle.pos.x = this.bounds[2].x - particle.size.radius;
        particle.velocity.x *= -this.damping;
      }
      if (particle.pos.y + particle.size.radius > this.bounds[2].y) {
        particle.pos.y = this.bounds[2].y - particle.size.radius;
        particle.velocity.y *= -this.damping;
      }
    });
  }
}

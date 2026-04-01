export default class Particle {
  constructor(sim, x, y, width, height, radius) {
    this.sim = sim;
    this.pos = { x: x, y: y };
    this.size = { width: width, height: height, radius: radius };
    this.velocity = { x: 0, y: 0 };
    this.gravity = 600;
  }
  update(dt) {
    this.velocity.y += this.gravity * dt;
    this.pos.y = this.velocity.y * dt + this.pos.y;
  }
  render() {
    this.sim.ctx.beginPath();
    this.sim.ctx.arc(this.pos.x, this.pos.y, this.size.radius, 0, 2 * Math.PI);
    this.sim.ctx.fillStyle = "rgba(0, 100, 200)";
    this.sim.ctx.fill();
    this.sim.ctx.lineWidth = 2;
    this.sim.ctx.strokeStyle = "yellow";
    this.sim.ctx.stroke();
  }
}

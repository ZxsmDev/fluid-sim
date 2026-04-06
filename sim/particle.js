export default class Particle {
  constructor(sim, x, y, width, height, radius) {
    this.sim = sim;
    this.pos = { x: x, y: y };
    this.size = { width: width, height: height, radius: radius };
    this.velocity = { x: 0, y: 0 };
    this.gravity = 600;
    this.damping = 0.9;

    const PIXELS_PER_METER = 100;
    const GRAVITY = 9.81; // m/s^2
    this.gravity_px = GRAVITY * PIXELS_PER_METER; // 981

    this.mass = 1;
  }
  update(dt) {
    this.velocity.y += this.gravity_px * dt;
    this.pos.y += this.velocity.y * dt;

    this.boundaries();
  }
  render() {
    this.sim.ctx.beginPath();
    this.sim.ctx.arc(this.pos.x, this.pos.y, this.size.radius, 0, 2 * Math.PI);
    this.sim.ctx.fillStyle = "rgba(0, 100, 200)";
    this.sim.ctx.fill();
  }
  boundaries() {
    // Draw
    this.sim.ctx.strokeStyle = "green";
    this.sim.ctx.beginPath();
    this.sim.ctx.moveTo(this.sim.bounds[3].x, this.sim.bounds[3].y);
    for (let i in this.sim.bounds) {
      this.sim.ctx.lineTo(this.sim.bounds[i].x, this.sim.bounds[i].y);
    }
    this.sim.ctx.stroke();

    // Run Collision
    if (this.pos.x - this.size.radius < this.sim.bounds[0].x) {
      this.pos.x = this.sim.bounds[0].x + this.size.radius;
      this.velocity.x *= -this.damping;
    }
    if (this.pos.y - this.size.radius < this.sim.bounds[0].y) {
      this.pos.y = this.sim.bounds[0].y + this.size.radius;
      this.velocity.y *= -this.damping;
    }
    if (this.pos.x + this.size.radius > this.sim.bounds[2].x) {
      this.pos.x = this.sim.bounds[2].x - this.size.radius;
      this.velocity.x *= -this.damping;
    }
    if (this.pos.y + this.size.radius > this.sim.bounds[2].y) {
      this.pos.y = this.sim.bounds[2].y - this.size.radius;
      this.velocity.y *= -this.damping;
    }
  }
}

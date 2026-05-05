export default class Particle {
  constructor(sim, x, y, width, height, radius) {
    this.sim = sim;

    this.pos = { x: x, y: y };
    this.velocity = { x: 0, y: 0 };

    this.size = { width: width, height: height, radius: radius };

    const PIXELS_PER_METER = 100;
    const GRAVITY = 9.81; // m/s^2
    this.gravity_px = GRAVITY * PIXELS_PER_METER; // 981
    this.damping = 0.9;
    this.mass = 1;
    this.density = 0;
  }
  update(dt, pressureAcceleration) {
    this.velocity.x += pressureAcceleration.x * dt;
    this.velocity.y += pressureAcceleration.y * dt;
    this.velocity.y += this.gravity_px * 4 * dt;
    this.pos.x += this.velocity.x * dt;
    this.pos.y += this.velocity.y * dt;

    this.boundaries();
  }
  render() {
    if (this.sim.params["drawSmoothing"]) {
      this.sim.ctx.beginPath();
      this.sim.ctx.arc(
        this.pos.x,
        this.pos.y,
        this.sim.params.smoothingRadius,
        0,
        2 * Math.PI
      );
      this.sim.ctx.fillStyle = "rgba(3, 0, 104, 0.1 )";
      this.sim.ctx.fill();
    }

    this.sim.ctx.beginPath();
    this.sim.ctx.arc(this.pos.x, this.pos.y, this.size.radius, 0, 2 * Math.PI);
    this.sim.ctx.fillStyle = "rgba(0, 100, 200)";
    this.sim.ctx.fill();
  }
  boundaries() {
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

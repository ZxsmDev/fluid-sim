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

    // move to pool and add to params
    this.smoothingRadius;
    this.targetDensity;
    this.pressureMultiplier;
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

  //================================================================
  // MOVE TO POOL
  //================================================================
  smoothingKernel(radius, dist) {
    let volume = (Math.PI * radius ** 8) / 4;
    let value = Max(0, radius ** 2 - dist ** 2);
    return value ** 3 / volume;
  }
  smoothingKernelDerivative(dist, radius) {
    if (dist >= radius) return 0;
    let f = radius ** 2 - dist ** 2;
    let scale = -24 / (Math.PI * radius ** 8);
    return scale * dist * f ** 2;
  }
  calcDensity(vec) {
    // ThiS may need to run in a loop
    let density = 0;

    let distance = this.findMagnitude({
      x: this.pos.x - vec.x,
      y: this.pos.y - vec.y,
    });

    let influence = this.smoothingKernel(this.smoothingRadius, distance);
    density += this.mass * influence;

    return density;
  }
  calcPressureForce(vec) {
    let pressureForce = { x: 0, y: 0 };

    for (let i = 0; i < this.sim.poolSize; i++) {
      let dist = this.findMagnitude(this.sim.pool.particles[i].pos - vec);
      let dir = (this.sim.pool.particles[i].pos - vec) / dist;
      let slope = this.smoothingKernelDerivative(dist, this.smoothingRadius);
      let density = this.calcDensity(this.sim.pool.particles[i].pos); // cache density values
      pressureForce +=
        (-this.convertDensityToPressure(density) * dir * slope * mass) /
        density;
    }
    return pressureForce;
  }
  findMagnitude(vec) {
    return Math.sqrt(vec.x ** 2 + vec.y ** 2);
  }
  convertDensityToPressure(density) {
    let densityError = density - targetDensity;
    let pressure = densityError * pressureMultiplier;
    return pressure;
  }
}

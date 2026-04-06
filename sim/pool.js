import Particle from "./particle.js";

export default class Pool {
  constructor(sim, size) {
    this.sim = sim;
    this.poolSize = size;
    this.particles = [];
    this.spawnParticles();
  }
  update(dt) {
    this.particles.forEach((i) => {
      i.update(dt);
    });
  }
  render() {
    this.particles.forEach((i) => {
      i.render();
    });
  }
  spawnParticles() {
    let numRows = this.sim.params["rows"] || 1;
    let columns = Math.ceil(this.poolSize / numRows);

    for (let i = 0; i < this.poolSize; i++) {
      let x =
        this.sim.bounds[1].x / 2 -
        (columns * this.sim.particleSize) / 2 +
        (i % columns) * this.sim.particleSize +
        this.sim.particleSize / 2;
      let y = 100 + Math.floor(i / columns) * this.sim.particleSize;

      this.particles.push(
        new Particle(
          this.sim,
          x,
          y,
          this.sim.particleSize,
          this.sim.particleSize,
          this.sim.particleRadius
        )
      );
    }
  }
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
    // This needs to run in a loop
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

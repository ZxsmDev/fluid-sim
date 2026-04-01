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
    for (let i = 0; i < this.poolSize; i++) {
      this.particles.push(
        new Particle(
          this.sim,
          this.sim.bounds[1].x / 2 -
            (this.poolSize * this.sim.particleSize) / 2 +
            this.sim.particleSize / 2 +
            i * this.sim.particleSize,
          0,
          this.sim.particleSize,
          this.sim.particleSize,
          this.sim.particleRadius
        )
      );
    }
  }
}

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
        this.sim.bounds[1].x / 2 - (columns * this.sim.particleSize) / 2 +
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
          this.sim.particleRadius,
        ),
      );
    }
  }
}

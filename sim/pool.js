import Particle from "./particle.js";

export default class Pool {
  constructor(sim, size) {
    this.sim = sim;
    this.poolSize = size;
    this.particles = [];

    this.spawnParticles();
  }
  update(dt) {
    this.particles.forEach((particle) => {
      particle.density = this.calcDensity(particle.pos);

      const pressureForce = this.calcPressureForce(particle.pos);
      const viscosityForce = this.calcViscosityForce(
        particle.pos,
        particle.velocity
      );
      const totalForce = {
        x: pressureForce.x + viscosityForce.x,
        y: pressureForce.y + viscosityForce.y,
      };
      const pressureAcceleration = {
        x: particle.density > 0 ? totalForce.x / particle.density : 0,
        y: particle.density > 0 ? totalForce.y / particle.density : 0,
      };

      particle.update(dt, pressureAcceleration);
    });
  }
  render() {
    this.particles.forEach((i) => {
      i.render();

      if (this.sim.params["vectorArrows"]) {
        this.drawForceArrow(
          this.sim.ctx,
          i.pos.x,
          i.pos.y,
          0,
          9.81,
          "orangered"
        ); // Gravity
        const pressure = this.calcPressureForce(i.pos);
        this.drawForceArrow(
          this.sim.ctx,
          i.pos.x,
          i.pos.y,
          pressure.x * 5,
          pressure.y * 5,
          "lightgreen"
        ); // Pressure
      }
    });

    this.sim.ctx.strokeStyle = "green";
    this.sim.ctx.beginPath();
    this.sim.ctx.moveTo(this.sim.bounds[3].x, this.sim.bounds[3].y);
    for (let i = 0; i < this.sim.bounds.length; i++) {
      this.sim.ctx.lineTo(this.sim.bounds[i].x, this.sim.bounds[i].y);
    }
    this.sim.ctx.stroke();
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
    let value = Math.max(0, radius ** 2 - dist ** 2);
    return value ** 3 / volume;
  }
  smoothingKernelDerivative(dist, radius) {
    if (!radius || isNaN(radius) || isNaN(dist)) return 0;
    if (dist >= radius) return 0;
    let f = radius ** 2 - dist ** 2;
    let scale = -24 / (Math.PI * radius ** 8);
    return scale * dist * f ** 2;
  }
  calcDensity(vec) {
    let density = 0;

    this.particles.forEach((particle) => {
      let distance = this.findMagnitude({
        x: particle.pos.x - vec.x,
        y: particle.pos.y - vec.y,
      });

      let influence = this.smoothingKernel(this.sim.smoothingRadius, distance);
      density += particle.mass * influence;
    });

    return density;
  }
  calcPressureForce(vec) {
    let pressureForce = { x: 0, y: 0 };

    for (let i = 0; i < this.poolSize; i++) {
      const diff = {
        x: this.particles[i].pos.x - vec.x,
        y: this.particles[i].pos.y - vec.y,
      };
      const dist = this.findMagnitude(diff);
      if (dist < 0.0001) continue; // skip self for division by 0

      const dir = { x: diff.x / dist, y: diff.y / dist };

      let slope = this.smoothingKernelDerivative(
        dist,
        this.sim.smoothingRadius
      );

      if (this.particles[i].density < 0.0001) continue; // skip zero density

      const pressureI = this.convertDensityToPressure(
        this.particles[i].density
      );
      const neighborForce =
        (-pressureI * slope * this.particles[i].mass) /
        this.particles[i].density;

      pressureForce.x += neighborForce * dir.x;
      pressureForce.y += neighborForce * dir.y;
    }
    return pressureForce;
  }
  calcViscosityForce(vec, velocity) {
    let viscosityForce = { x: 0, y: 0 };
    const viscosity = 0.001;

    for (let i = 0; i < this.poolSize; i++) {
      const diff = {
        x: this.particles[i].pos.x - vec.x,
        y: this.particles[i].pos.y - vec.y,
      };
      const dist = this.findMagnitude(diff);
      if (dist < 0.0001) continue;

      const velDiff = {
        x: this.particles[i].velocity.x - velocity.x,
        y: this.particles[i].velocity.y - velocity.y,
      };

      let influence = this.smoothingKernel(this.sim.smoothingRadius, dist);

      viscosityForce.x +=
        viscosity * this.particles[i].mass * velDiff.x * influence;
      viscosityForce.y +=
        viscosity * this.particles[i].mass * velDiff.y * influence;
    }
    return viscosityForce;
  }
  findMagnitude(vec) {
    return Math.sqrt(vec.x ** 2 + vec.y ** 2);
  }
  convertDensityToPressure(density) {
    let densityError = density - this.sim.targetDensity;
    let pressure = densityError * this.sim.pressureMultiplier;
    return pressure;
  }
  drawForceArrow(ctx, x, y, fx, fy, color) {
    if (fx < 2 && fy < 2) return;

    const arrowLength = 10;
    const arrowHeadSize = 15;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + fx * arrowLength, y + fy * arrowLength);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(fy, fx);
    ctx.beginPath();
    ctx.moveTo(x + fx * arrowLength, y + fy * arrowLength);
    ctx.lineTo(
      x + fx * arrowLength - arrowHeadSize * Math.cos(angle - Math.PI / 6),
      y + fy * arrowLength - arrowHeadSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x + fx * arrowLength - arrowHeadSize * Math.cos(angle + Math.PI / 6),
      y + fy * arrowLength - arrowHeadSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}

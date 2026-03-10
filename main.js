import SimManager from "./sim/simManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas")
  const ctx = canvas.getContext("2d")
  const sim = new SimManager(canvas, ctx);
  sim.init();
});

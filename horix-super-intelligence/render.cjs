// Renders index.html frame by frame (render(t) is a pure function of time) into an mp4, or stills.
// usage: node render.cjs <fps> <out.mp4> [t0 t1]     |   node render.cjs stills t1,t2,... <outdir>
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const { serve } = require("./serve.cjs");
const [mode, a, b, c] = process.argv.slice(2);
(async () => {
  const PORT = +(process.env.PORT || 8830);
  const srv = await serve(PORT);
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: +(process.env.DPR || 1) });
  p.on("pageerror", (e) => console.error("ERR", e.message));
  p.on("console", (m) => m.type() === "error" && console.error("CONSOLE", m.text()));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "load" });
  await p.evaluate(() => window.ready);
  const dur = await p.evaluate(() => window.DURATION);
  if (mode === "stills") {
    for (const t of a.split(",").map(Number)) {
      await p.evaluate((t) => window.render(t), t);
      await p.screenshot({ path: `${b}/t_${t.toFixed(2)}.jpg`, quality: 85, type: "jpeg" });
    }
  } else {
    const fps = +mode, out = a, t0 = +(b || 0), t1 = +(c || dur);
    const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", out], { stdio: ["pipe", "inherit", "inherit"] });
    const n = Math.round((t1 - t0) * fps); // end-exclusive: 35 s at 30 fps = 1050 frames
    const st = Date.now();
    for (let i = 0; i < n; i++) {
      await p.evaluate((t) => window.render(t), t0 + i / fps);
      const buf = await p.screenshot({ type: "jpeg", quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      if (i % 150 === 0) console.log(`frame ${i}/${n} ${((Date.now() - st) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on("close", r));
  }
  await br.close();
  srv.close();
})();

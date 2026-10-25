// Renders the cup stills into assets/cup/ and traces the cup outline for the AI-select "marching ants".
// usage: node cup/render_cup.cjs   (then: python3 cup/outline.py)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { serve } = require("../serve.cjs");

(async () => {
  const srv = await serve(8812);
  const out = path.join(__dirname, "..", "assets", "cup");
  fs.mkdirSync(out, { recursive: true });
  const br = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist"] });
  const p = await br.newPage({ viewport: { width: 1040, height: 1300 } });
  p.on("pageerror", (e) => console.error("ERR", e.message));
  p.on("console", (m) => m.type() === "error" && console.error("CONSOLE", m.text()));
  await p.goto("http://127.0.0.1:8812/cup/cup.html");
  await p.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
  for (const mode of ["full", "cut", "logo", "full-logo"]) {
    const url = await p.evaluate((m) => window.shot(m), mode);
    fs.writeFileSync(path.join(out, `${mode}.png`), Buffer.from(url.split(",")[1], "base64"));
    console.log("wrote", mode);
  }
  await br.close();
  srv.close();
})();

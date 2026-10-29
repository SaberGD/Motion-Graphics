// node svg2png.js in.svg out.png [bg]  -> renders the SVG at its own size (transparent unless bg is given)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [inp, outp, bg] = process.argv.slice(2);
  const svg = fs.readFileSync(inp, 'utf8');
  const m = svg.match(/viewBox="([\d.\s-]+)"/); const [, , w, h] = m ? m[1].trim().split(/\s+/).map(Number) : [0, 0, 1080, 1080];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: Math.round(w), height: Math.round(h) } });
  await p.setContent(`<body style="margin:0;background:${bg || 'transparent'}">${svg}</body>`);
  await p.evaluate(() => { const s = document.querySelector('svg'); s.setAttribute('width', s.viewBox.baseVal.width); s.setAttribute('height', s.viewBox.baseVal.height); });
  await p.screenshot({ path: outp, omitBackground: !bg }); await b.close();
})();

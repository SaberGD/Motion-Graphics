// The demo brand the designer builds in the ad: «بُنّ», a coffee bean over the Arabic wordmark.
// One definition, used by the vector artboard (SVG), the pixel shatter (canvas) and the cup decal (canvas).
// Coordinates are in a 560×560 artboard.
const LOGO = {
  bean: { cx: 280, cy: 205, rot: 32 },
  // Outline anchors (relative to the bean centre, before rotation) with their handles.
  nodes: [
    { p: [0, -92], h: [34, 0] },
    { p: [64, 0], h: [0, 52] },
    { p: [0, 92], h: [-34, 0] },
    { p: [-64, 0], h: [0, -52] },
  ],
  crease: "M 7 -76 C -40 -28, 40 26, -7 76",
  word: { text: "بُنّ", x: 280, y: 438, size: 150 },
  tag: { text: "قهوة مختصة", x: 280, y: 508, size: 34 },
  colors: { bean: "#E58A2E", ink: "#1D1510", tag: "#9A7350" },
};

// Cubic segment i of the outline: from node i to node i+1.
function beanSeg(i) {
  const a = LOGO.nodes[i], b = LOGO.nodes[(i + 1) % 4];
  return [a.p, [a.p[0] + a.h[0], a.p[1] + a.h[1]], [b.p[0] - b.h[0], b.p[1] - b.h[1]], b.p];
}
function beanPath() {
  const n = LOGO.nodes;
  let d = `M ${n[0].p[0]} ${n[0].p[1]}`;
  for (let i = 0; i < 4; i++) { const [, c1, c2, e] = beanSeg(i); d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${e[0]} ${e[1]}`; }
  return d + " Z";
}

// Draw the finished logo into a 2D context whose origin is the artboard's top-left, at scale k.
function drawLogo(ctx, k = 1, o = {}) {
  const c = { ...LOGO.colors, ...(o.colors || {}) };
  const { cx, cy, rot } = LOGO.bean;
  ctx.save();
  ctx.scale(k, k);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.fillStyle = c.bean;
  ctx.fill(new Path2D(beanPath()));
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 13;
  ctx.lineCap = "round";
  ctx.stroke(new Path2D(LOGO.crease));
  ctx.restore();
  ctx.fillStyle = c.ink;
  ctx.textAlign = "center";
  ctx.direction = "rtl";
  ctx.font = `900 ${LOGO.word.size}px Cairo`;
  ctx.fillText(LOGO.word.text, LOGO.word.x, LOGO.word.y);
  if (o.tag !== false) {
    ctx.fillStyle = c.tag;
    ctx.font = `700 ${LOGO.tag.size}px Cairo`;
    ctx.fillText(LOGO.tag.text, LOGO.tag.x, LOGO.tag.y);
  }
  ctx.restore();
}

if (typeof module !== "undefined") module.exports = { LOGO, beanSeg, beanPath, drawLogo };

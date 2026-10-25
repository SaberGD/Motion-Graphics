# Traces the cup silhouette (outer edge + the hole in the handle) from assets/cup/cut.png into an
# SVG path, in the image's own 1040x1300 pixels. Used for the AI-select "marching ants".
import json, os
import cv2

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "..", "assets", "cup", "cut.png")
a = cv2.imread(src, cv2.IMREAD_UNCHANGED)[:, :, 3]
_, m = cv2.threshold(a, 128, 255, cv2.THRESH_BINARY)
cs, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
parts = []
for c in cs:
    if cv2.contourArea(c) < 400:
        continue
    c = cv2.approxPolyDP(c, 1.2, True)
    parts.append("M " + " L ".join(f"{p[0][0]} {p[0][1]}" for p in c) + " Z")
x, y, w, h = cv2.boundingRect(max(cs, key=cv2.contourArea))
json.dump({"w": a.shape[1], "h": a.shape[0], "d": " ".join(parts), "box": [x, y, w, h]},
          open(os.path.join(here, "..", "assets", "cup", "outline.json"), "w"))
print(len(parts), "contours, box", x, y, w, h)

"""Track the speaker's face (YuNet): writes [[t, cx, cy, h], ...] in normalised source coords, every 3rd frame."""
import cv2, json, os, sys
cap = cv2.VideoCapture(sys.argv[1]); fps = cap.get(cv2.CAP_PROP_FPS)
det = None; out, i, prev = [], 0, None
while True:
    ok, fr = cap.read()
    if not ok: break
    if i % 3 == 0:
        s = 720 / fr.shape[1]; g = cv2.resize(fr, None, fx=s, fy=s); h, w = g.shape[:2]
        if det is None:
            det = cv2.FaceDetectorYN.create(os.path.join(os.path.dirname(__file__), 'models/yunet.onnx'), '', (w, h), .6)
        _, fs = det.detect(g)
        if fs is not None and len(fs):
            key = (lambda f: (f[0] + f[2] / 2 - prev[0]) ** 2 + (f[1] + f[3] / 2 - prev[1]) ** 2) if prev else (lambda f: -f[14])
            f = min(fs, key=key); prev = (f[0] + f[2] / 2, f[1] + f[3] / 2)
            out.append([round(i / fps, 3), round(float(prev[0]) / w, 4), round(float(prev[1]) / h, 4), round(float(f[3]) / h, 4)])
    i += 1
json.dump(out, open(sys.argv[2], 'w')); print(sys.argv[1], 'frames', i, 'detections', len(out))

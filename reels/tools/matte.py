"""Person alpha matte with Robust Video Matting (recurrent, temporally stable).
usage: matte.py <src.mp4> <out_alpha.mp4> [model] [downsample]
Writes a grayscale alpha video at the source's 9:16 working resolution (1080x1920)."""
import sys, subprocess, numpy as np, cv2, onnxruntime as ort, os
src, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(__file__), 'models/rvm_resnet50_fp32.onnx')
ds = float(sys.argv[4]) if len(sys.argv) > 4 else 0.375
so = ort.SessionOptions(); so.intra_op_num_threads = 4
sess = ort.InferenceSession(model, so, providers=['CPUExecutionProvider'])
cap = cv2.VideoCapture(src); fps = cap.get(cv2.CAP_PROP_FPS)
W, H = 1080, 1920
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                       '-c:v', 'libx264', '-preset', 'medium', '-crf', '10', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
rec = [np.zeros([1, 1, 1, 1], np.float32)] * 4
dsr = np.array([ds], np.float32)
n = 0
while True:
    ok, fr = cap.read()
    if not ok: break
    sh, sw = fr.shape[:2]
    bw = min(sw, sh * 9 / 16); x0 = int((sw - bw) / 2)
    fr = cv2.resize(fr[:, x0:x0 + int(bw)], (W, H), interpolation=cv2.INTER_AREA)
    x = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB).astype(np.float32).transpose(2, 0, 1)[None] / 255.
    fgr, pha, *rec = sess.run(None, {'src': x, 'r1i': rec[0], 'r2i': rec[1], 'r3i': rec[2], 'r4i': rec[3], 'downsample_ratio': dsr})
    a = (np.clip(pha[0, 0], 0, 1) * 255).astype(np.uint8)
    ff.stdin.write(a.tobytes()); n += 1
    if n % 60 == 0: print('matte', n, flush=True)
ff.stdin.close(); ff.wait(); print('done', n)

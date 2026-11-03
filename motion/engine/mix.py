"""Mix an SG MOTION piece: voiceover + music bed (from the track's start) + recorded SFX, mastered to -14 LUFS.

usage: python3 mix.py <mix.json> <out.wav>
mix.json: {"dur": s, "vo": {"file":, "at": s, "gain": dB},
           "music": {"file":, "at": 0, "gain": dB, "duck": dB, "duck_smooth": s, "af": "<ffmpeg eq>", "fade": s},
           "sfx": [{"t":, "file":, "g": peak dBFS, "rate": 1.0}, ...]}
Paths are relative to mix.json. Voice first: the music dips gently under speech and has an EQ pocket at 1.5/3 kHz.
"""
import json, os, subprocess, sys
import numpy as np

SR = 48000
cfg = json.load(open(sys.argv[1])); D = os.path.dirname(os.path.abspath(sys.argv[1])); OUT = sys.argv[2]
N = int(cfg['dur'] * SR)
db = lambda x: 10 ** (x / 20)


def load(p, ch=2, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', os.path.join(D, p), '-vn'] + (['-af', af] if af else []) + ['-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, ch).copy()


def place(dst, x, at):
    i = int(at * SR); x = x[:max(0, len(dst) - i)]; dst[i:i + len(x)] += x


V = cfg['vo']; vo = np.zeros((N, 2), np.float32); place(vo, load(V['file']) * db(V.get('gain', 0)), V.get('at', 0))
M = cfg['music']; mus = np.zeros((N, 2), np.float32); place(mus, load(M['file'], af=M.get('af')), M.get('at', 0))
# gentle duck that follows the voice
env = np.abs(vo[:, 0]); w = int(.05 * SR); env = np.convolve(env, np.ones(w) / w, 'same')
talk = (env > db(-42)).astype(np.float32); k = int(M.get('duck_smooth', .6) * SR); talk = np.convolve(talk, np.ones(k) / k, 'same')
g = db(M.get('gain', -22)) * db(M.get('duck', -4) * np.clip(talk * 1.6, 0, 1))
fade = M.get('fade', 1.2); ie = N; g[ie - int(fade * SR):] *= np.linspace(1, 0, int(fade * SR))
mus *= g[:, None]
sfx = np.zeros((N, 2), np.float32)
for e in cfg.get('sfx', []):
    x = load(e['file'], ch=1)[:, 0]
    if e.get('rate', 1) != 1: x = np.interp(np.arange(0, len(x) - 1, e['rate']), np.arange(len(x)), x).astype(np.float32)
    x = x / (np.abs(x).max() + 1e-9) * db(e.get('g', -28)); place(sfx, np.repeat(x[:, None], 2, 1), e['t'])
if os.environ.get('STEMS'):
    for nm, st in (('vo', vo), ('music', mus), ('sfx', sfx)):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', f'{OUT}.{nm}.wav'], input=st.tobytes(), check=True)
mix = vo + mus + sfx; tmp = OUT + '.pre.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', tmp], input=mix.astype(np.float32).tobytes(), check=True)
st = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(st[st.rindex('{'):st.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.2:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-c:a', 'pcm_s24le', OUT], check=True); os.remove(tmp)
print('mix', OUT, f"{cfg['dur']:.2f}s", len(cfg.get('sfx', [])), 'sfx', 'in', js['input_i'], 'LUFS')

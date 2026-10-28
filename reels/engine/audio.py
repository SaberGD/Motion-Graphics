"""Audio: jump-cut voice + synthesised SFX (auto from the graphics spec) + music edit ducked under the voice.

usage: audio.py <spec.json> <out.wav>
spec.music = {"file":, "segs": [[m0, m1], ...] (music-file ranges, concatenated from out t=0), "gain": dB,
              "duck": dB, "stops": [[t0, t1], ...] (music mutes for a beat-stop), "end_fade": s}
spec.sfx   = extra [{"t":, "type":, "g": dB}], spec.sfx_off = [types to suppress]
"""
import json, os, subprocess, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from timeline import load_spec, keeps, out_duration, speech_duration

SR = 48000
spec = load_spec(sys.argv[1]); OUT = sys.argv[2]; D = spec['_dir']
DUR = out_duration(spec); N = int(DUR * SR) + SR // 10
rng = np.random.RandomState(7)


def load(path, ss=None, t=None, ch=2, af=None):
    cmd = ['ffmpeg', '-v', 'error']
    if ss is not None: cmd += ['-ss', str(ss)]
    if t is not None: cmd += ['-t', str(t)]
    cmd += ['-i', path, '-vn']
    if af: cmd += ['-af', af]
    cmd += ['-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-']
    a = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)
    return a.reshape(-1, ch).copy()


db = lambda x: 10 ** (x / 20)

# ---------- voice: jump cuts with 12 ms crossfades ----------
VOICE_AF = spec.get('voice_af', 'highpass=f=75,lowpass=f=15000,afftdn=nr=8:nf=-42,acompressor=threshold=-20dB:ratio=2.6:attack=8:release=140:makeup=3dB,equalizer=f=3200:t=q:w=1.2:g=2,equalizer=f=220:t=q:w=1:g=-1.5')
raw = load(os.path.join(D, spec['src']), ch=1, af=VOICE_AF)[:, 0]
voice = np.zeros(N, np.float32); pos = 0; XF = int(.012 * SR)
for s, e in keeps(spec):
    seg = raw[int(s * SR):int(e * SR)].copy()
    seg[:XF] *= np.linspace(0, 1, XF); seg[-XF:] *= np.linspace(1, 0, XF)
    voice[pos:pos + len(seg)] += seg[:N - pos]; pos += len(seg) - XF // 2
voice *= db(spec.get('voice_gain', 0))

# ---------- SFX synthesis ----------
t_ = lambda d: np.arange(int(d * SR)) / SR


def noise(d):
    return rng.randn(int(d * SR)).astype(np.float32)


def bandsweep(x, f0, f1):
    """crude time-varying one-pole lowpass sweep."""
    out = np.empty_like(x); y = 0
    fs = np.geomspace(f0, f1, len(x))
    a = np.exp(-2 * np.pi * fs / SR)
    for i in range(len(x)):
        y = a[i] * y + (1 - a[i]) * x[i]; out[i] = y
    return out


def whoosh(d=.55, up=True):
    n = noise(d); env = np.sin(np.linspace(0, np.pi, len(n))) ** 2
    s = bandsweep(n, 300, 6000) if up else bandsweep(n, 6000, 300)
    s = s - bandsweep(s, 120, 120)
    return s * env * 2.2


def riser(d=1.2):
    t = t_(d); f = 200 * (2 ** (t / d * 3)); ph = 2 * np.pi * np.cumsum(f) / SR
    s = .35 * np.sin(ph) + .25 * bandsweep(noise(d), 400, 9000)
    return s * (t / d) ** 2


def impact(d=.9):
    t = t_(d); f = 120 * np.exp(-t * 9) + 42; ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 5.5)
    hit = bandsweep(noise(d), 4000, 300) * np.exp(-t * 22) * .8
    return (body * 1.1 + hit)


def pop(f=900, d=.09):
    t = t_(d); return np.sin(2 * np.pi * (f + 900 * np.exp(-t * 60)) * t) * np.exp(-t * 55)


def click(d=.03):
    t = t_(d); return (noise(d) * .6 + np.sin(2 * np.pi * 2400 * t)) * np.exp(-t * 260)


def tick(d=.02):
    t = t_(d); return noise(d) * np.exp(-t * 400) * .5


def shimmer(d=.9):
    t = t_(d); s = sum(np.sin(2 * np.pi * f * t + k) * np.exp(-t * (4 + k)) for k, f in enumerate([2093, 2637, 3136, 4186, 5274]))
    return s * .25 * np.minimum(1, t / .01)


def glitch(d=.25):
    s = noise(d); blocks = np.repeat(rng.choice([0, 1], int(d * 60)), int(SR / 60))[:len(s)]
    s[:len(blocks)] *= blocks
    s = np.round(s * 4) / 4
    return s * .5 * np.exp(-t_(d) * 6)


def shutter():
    return np.concatenate([click() * 1.2, np.zeros(int(.05 * SR)), click() * .9])


SYN = dict(whoosh=lambda: whoosh(), whoosh_dn=lambda: whoosh(.45, False), riser=riser, impact=impact, pop=pop,
           pop_lo=lambda: pop(500, .12), click=click, tick=tick, shimmer=shimmer, glitch=glitch, shutter=shutter)
GAIN = dict(whoosh=-15, whoosh_dn=-17, riser=-20, impact=-11, pop=-17, pop_lo=-15, click=-18, tick=-20, shimmer=-21,
            glitch=-20, shutter=-14)

events = []
for el in spec.get('els', []):
    ty = el['type']
    if ty == 'kin':
        events.append((el['t0'] - .25, 'whoosh'))
        for ln in el.get('lines', []):
            at = el['t0'] + ln.get('at', 0); an = ln.get('anim', 'blur'); n = len(ln['text'].split()); st = ln.get('stagger', .09)
            if an == 'slam': events.append((at, 'impact'))
            elif an == 'pop':
                for k in range(n): events.append((at + k * st, 'pop'))
            elif an == 'type':
                for k in range(n): events.append((at + k * st, 'tick'))
            elif an == 'glitch': events.append((at, 'glitch'))
            elif an in ('blur', 'rise', 'scatter'): events.append((at, 'pop_lo'))
        for s in el.get('sparks', []): events.append((el['t0'] + (s[3] if len(s) > 3 else .2), 'shimmer'))
        events.append((el['t1'] - .12, 'whoosh_dn'))
    elif ty == 'chips':
        if el.get('title'): events.append((el['t0'], 'pop_lo'))
        for k in range(len(el['items'])): events.append(((el['at'][k] if el.get('at') else el['t0'] + .15 + k * .2), 'pop'))
    elif ty == 'prompt':
        ts = el.get('ts', el['t0'] + .45); te = el.get('te', ts + len(el['text']) * .045)
        events.append((el['t0'], 'whoosh'))
        for k in range(len(el['text'])):
            if el['text'][k] != ' ': events.append((ts + (te - ts) * k / len(el['text']), 'tick'))
        sk = el.get('send', te + .25); events += [(sk, 'click'), (sk + .05, 'shimmer')]
    elif ty in ('card', 'toast', 'stat', 'bars'):
        events.append((el['t0'] - .05, 'whoosh'))
        if ty == 'stat': events.append((el['t0'] + el.get('count', 1), 'pop'))
    elif ty == 'vf':
        events.append((el['t0'], 'shutter'))
    elif ty == 'sweep':
        events.append((el['t'] - el.get('d', .5) * .6, 'whoosh'))
    elif ty == 'outro':
        events += [(el['t0'] - .9, 'riser'), (el['t0'] + .15, 'impact'), (el['t0'] + .4, 'shimmer')]
for f in spec.get('fx', []):
    if f['type'] in ('zoomblur', 'whip'): events.append((f['t'] - .2, 'whoosh'))
for p in spec.get('punch', []):
    if len(p) > 3 and p[3] == 'hit': events.append((p[0], 'impact'))
for e in spec.get('sfx', []): events.append((e['t'], e['type'], e.get('g', 0)))
off = set(spec.get('sfx_off', []))

sfx = np.zeros(N, np.float32)
for ev in events:
    t, ty = ev[0], ev[1]
    if ty in off or t < 0: continue
    s = SYN[ty]().astype(np.float32) * db(GAIN[ty] + (ev[2] if len(ev) > 2 else 0) + spec.get('sfx_gain', 0))
    i = int(t * SR); s = s[:max(0, N - i)]; sfx[i:i + len(s)] += s

# ---------- music ----------
mus = np.zeros((N, 2), np.float32)
M = spec.get('music')
if M:
    mf = os.path.join(D, M['file']); pos = int(M.get('at', 0) * SR); XF = int(.03 * SR)
    for m0, m1 in M['segs']:
        seg = load(mf, m0, m1 - m0 + .03)
        seg[:XF] *= np.linspace(0, 1, XF)[:, None]; seg[-XF:] *= np.linspace(1, 0, XF)[:, None]
        seg = seg[:max(0, N - pos)]; mus[pos:pos + len(seg)] += seg; pos += len(seg) - XF
    # beat-stops
    g = np.ones(N, np.float32)
    for a, b in M.get('stops', []):
        i0, i1 = int(a * SR), int(b * SR); r = int(.02 * SR)
        g[i0:i1] = 0; g[i0 - r:i0] = np.minimum(g[i0 - r:i0], np.linspace(1, 0, r)); g[i1:i1 + r] = np.linspace(0, 1, r)
    # end fade
    ef = M.get('end_fade', 1.5); ie = int(DUR * SR)
    g[ie - int(ef * SR):ie] *= np.linspace(1, 0, int(ef * SR)); g[ie:] = 0
    # duck under voice: envelope follower on the voice
    env = np.abs(voice); w = int(.05 * SR)
    env = np.convolve(env, np.ones(w) / w, 'same')
    speaking = (env > db(-42)).astype(np.float32)
    k = int(.25 * SR); speaking = np.convolve(speaking, np.ones(k) / k, 'same')  # smooth attack/release
    duck = db(M.get('duck', -9) * np.clip(speaking * 1.6, 0, 1))
    mus *= (g * duck * db(M.get('gain', -16)))[:, None]

mix = mus + (voice + sfx)[:, None]
mix = mix[:int(DUR * SR)]
tmp = OUT + '.pre.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', tmp], input=mix.astype(np.float32).tobytes(), check=True)
# loudness: -14 LUFS integrated, -1 dBTP
st = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(st[st.rindex('{'):st.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.2:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-c:a', 'pcm_s24le', OUT], check=True)
os.remove(tmp)
print('audio', OUT, f'{DUR:.2f}s', len(events), 'sfx events', 'in', js['input_i'], 'LUFS')

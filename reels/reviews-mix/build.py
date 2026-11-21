"""Build the student reviews mix from edl.json.

1. base.mp4: the clips cut from the sources (1080x1920, 30 fps; r1 is 720p and is scaled), with a gentle punch-in on
   every other clip (cut-synchronised, ≤1.08×), plus black slots for the chapter cards and the end card.
2. dialogue.wav: the speech of each clip. With demucs stems (sep/<src>_vocals.wav) the sources' own music beds are gone,
   so the clips sit under one track. Each clip gets 15 ms in / 30 ms out fades.
3. mix.json → mix.wav (motion/engine/mix.py): the dialogue, Funky Fusion from its start, ducked with an EQ pocket,
   and one soft SFX per card and on the end card.
4. overlay PNGs (overlay.html, ALPHA=1) over base → out/student_reviews_mix.mp4
usage: python3 build.py   (BUILD=<dir> for the intermediates)
"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..', '..'); RAW = os.path.join(ROOT, 'raw', 'reviews')
B = os.environ.get('BUILD', '/tmp/reviews_build'); os.makedirs(B, exist_ok=True); os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
E = json.load(open(os.path.join(HERE, 'edl.json'))); FPS = E['fps']; DUR = E['dur']
SEP = os.environ.get('SEP', os.path.join(B, 'sep'))   # <src>_vocals.wav from demucs
run = lambda *a: subprocess.run(a, check=True)

# ---------- 1+2: base video and dialogue ----------
srcs = ['r1', 'r2', 'r3']; inputs = []
voc = {s: os.path.join(SEP, s + '_vocals.wav') for s in srcs}
use_sep = all(os.path.exists(v) for v in voc.values())
print('dialogue from', 'demucs vocals' if use_sep else 'the original mixes')
# one input per clip (an input stream can feed the graph only once): video with -ss/-t, audio likewise
fv, fa, n, ci, k = [], [], 0, 0, 0
for r in E['tl']:
    d = round(r['t1'] - r['t0'], 3)
    if r['kind'] == 'clip':
        z = 1.0 if ci % 2 == 0 else 1.05; ci += 1
        W, H = round(1080 * z / 2) * 2, round(1920 * z / 2) * 2; x, y = (W - 1080) // 2, int((H - 1920) * .36)
        inputs += ['-ss', str(r['i']), '-t', str(d), '-i', os.path.join(RAW, r['src'] + '.mp4')]; kv = k; k += 1
        if use_sep: inputs += ['-ss', str(r['i']), '-t', str(d), '-i', voc[r['src']]]; ka = k; k += 1
        else: ka = kv
        # static framing per clip (zoompan's whole-pixel steps made a slow push shimmer): 1.0 / 1.05 alternating, the change only on the cut
        fv.append(f"[{kv}:v]setpts=PTS-STARTPTS,scale={W}:{H}:flags=lanczos,crop=1080:1920:{x}:{y},setsar=1,fps={FPS},trim=duration={d},format=yuv420p[v{n}]")
        fa.append(f"[{ka}:a]asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,atrim=duration={d},apad=whole_dur={d},afade=t=in:d=0.015,afade=t=out:st={max(0, d - .03):.3f}:d=0.03[a{n}]")
    else:
        fv.append(f"color=c=0x0A0A0A:s=1080x1920:r={FPS}:d={d},setsar=1,format=yuv420p[v{n}]")
        fa.append(f"anullsrc=r=48000:cl=stereo,atrim=duration={d}[a{n}]")
    n += 1
fc = ';'.join(fv + fa) + ';' + ''.join(f'[v{i}][a{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=1[v][a]'
run('ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p',
    os.path.join(B, 'base.mp4'), '-map', '[a]', '-c:a', 'pcm_s16le', os.path.join(B, 'dialogue.wav'))
run('ffmpeg', '-v', 'error', '-y', '-i', os.path.join(B, 'dialogue.wav'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', os.path.join(B, 'dialogue_n.wav'))

# ---------- 3: mix ----------
MAP = json.load(open(os.path.join(ROOT, 'reels', 'library', 'sfx_map.json')))
def sfx(role, t, dg=-2):
    m = MAP[role]; return dict(t=round(t, 3), file=os.path.join(ROOT, 'reels', 'library', 'sfx', m['file'] + '.ogg'), g=m['g'] + dg, rate=m.get('rate', 1.0))
S = []
for r in E['tl']:
    if r['kind'] == 'card': S += [sfx('reveal', r['t0'] + .02), sfx('tick', r['t0'] + .14, -4)]
    if r['kind'] == 'outro': S += [sfx('outro', r['t0'] + .15), sfx('outro_low', r['t0'] + .13)]
mix = dict(dur=DUR, vo=dict(file=os.path.join(B, 'dialogue_n.wav'), at=0, gain=0),
           sfx=S)   # no music bed (client: «شيل المزيكا اللي ضيفناها»)

json.dump(mix, open(os.path.join(HERE, 'mix.json'), 'w'), indent=1)
run('python3', os.path.join(ROOT, 'motion', 'engine', 'mix.py'), os.path.join(HERE, 'mix.json'), os.path.join(B, 'mix.wav'))

# ---------- 4: graphics + final ----------
OV = os.path.join(B, 'ov')
if not os.environ.get('SKIP_OV'):
    subprocess.run(['rm', '-rf', OV]); subprocess.run(['node', os.path.join(ROOT, 'motion', 'engine', 'render.js'), 'overlay.html', OV, str(FPS), str(DUR), os.environ.get('WORKERS', '4')],
                   cwd=HERE, env=dict(os.environ, ALPHA='1'), check=True)
out = os.path.join(HERE, 'out', 'student_reviews_mix.mp4')
run('ffmpeg', '-v', 'error', '-y', '-i', os.path.join(B, 'base.mp4'), '-framerate', str(FPS), '-i', os.path.join(OV, 'f_%05d.png'), '-i', os.path.join(B, 'mix.wav'),
    '-filter_complex', '[0:v][1:v]overlay=0:0:format=auto,format=yuv420p[v]', '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-tune', 'film',
    '-r', str(FPS), '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out)
print('built', out)

"""QC a generated voiceover against its script: Whisper (Egyptian-primed) → word diff, duration, loudness, audio-tag leak.

usage: python3 vo_qc.py <audio> <spoken.txt> ["context prompt"] [--words out.json]
Normalises Arabic spelling (hamza forms, ة/ه, ى/ي, tashkeel) and the lexicon's English terms, so the diff only shows real
differences. Spelling variants Whisper prefers (معانا/معنا, فرايداي/فرايدي) still show up: judge those by ear.
"""
import json, os, re, subprocess, sys, difflib
import xml.etree.ElementTree as ET
import librosa
from faster_whisper import WhisperModel

args = [a for a in sys.argv[1:] if not a.startswith('--')]
AUDIO, TXT = args[0], args[1]; PROMPT = args[2] if len(args) > 2 else None
OUTW = sys.argv[sys.argv.index('--words') + 1] if '--words' in sys.argv else None
LEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'library', 'voice', 'saber_lexicon.pls')
ns = {'p': 'http://www.w3.org/2005/01/pronunciation-lexicon'}
ALIAS = sorted([(lx.find('p:grapheme', ns).text, lx.find('p:alias', ns).text) for lx in ET.parse(LEX).getroot().findall('p:lexeme', ns) if lx.find('p:alias', ns) is not None], key=lambda r: -len(r[0]))


def norm(t):
    t = re.sub(r'\[[^\]]*\]', '', t)
    for g, a in ALIAS: t = re.sub(rf'(?<![A-Za-z]){re.escape(g)}(?![A-Za-z])', a, t)
    t = re.sub(r'[ً-ْـ]', '', t)
    for a, b in (('أ', 'ا'), ('إ', 'ا'), ('آ', 'ا'), ('ة', 'ه'), ('ى', 'ي'), ('ڤ', 'ف'), ('چ', 'ج')): t = t.replace(a, b)
    t = re.sub(r'\bال\s+', 'ال', t)
    return re.sub(r'[^\w\s]', ' ', t).lower().split()


ref = open(TXT).read()
m = WhisperModel('large-v3', device='cpu', compute_type='int8', cpu_threads=4)
y = librosa.load(AUDIO, sr=16000)[0]
segs, _ = m.transcribe(y, language='ar', beam_size=5, initial_prompt=PROMPT, condition_on_previous_text=False, word_timestamps=bool(OUTW))
segs = list(segs); heard = ' '.join(s.text for s in segs)
if OUTW: json.dump([dict(w=w.word.strip(), s=round(w.start, 2), e=round(w.end, 2)) for s in segs for w in s.words], open(OUTW, 'w'), ensure_ascii=False, indent=0)
R, H = norm(ref), norm(heard); sm = difflib.SequenceMatcher(a=R, b=H)
lu = subprocess.run(['ffmpeg', '-hide_banner', '-i', AUDIO, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = [l.strip() for l in lu.splitlines() if l.strip().startswith(('I:', 'Peak:'))][-2:]
leak = [t for t in re.findall(r'\[([^\]]+)\]', ref) if t.lower() in heard.lower()]
print(f'{os.path.basename(AUDIO)}: {len(y) / 16000:.1f}s  {" ".join(I)}  word match {sm.ratio() * 100:.1f}%  tag leak: {leak or "none"}')
for op, a, b, c, d in sm.get_opcodes():
    if op != 'equal': print(f'   script: {" ".join(R[a:b]) or "-":40s} | heard: {" ".join(H[c:d]) or "-"}')

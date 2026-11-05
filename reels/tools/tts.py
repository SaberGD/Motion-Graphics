"""Generate speech in Saber's own cloned voice (ElevenLabs) for approved text only.

usage: python3 tts.py "<approved Arabic text>" <out.wav> [--preset pickup|vo|energetic] [--model eleven_v4]
                      [--stability .6] [--similarity .85] [--style .1] [--speed 1.0] [--voice <id>] [--no-lexicon] [--seed N]
The key comes from the env var ELEVENLABS_API_KEY, or from the file named by ELEVENLABS_API_KEY_FILE.
It is never written to the repo.

Best practices applied (reels/library/voice/ElevenLabs_Arabic_Voice_Guide.md):
  * model eleven_v4: audio tags [..], inline IPA "/…/", alias/phoneme dictionaries. No SSML <break>, so pause with
    "،" "—" "…" or [pause].
  * stability 60-85% for narration/explanations, 30-55% for conversational. similarity 75-90%. style 0-20%.
    speed 0.9-1.1.
  * write Egyptian Arabic as spoken; add tashkeel to ambiguous words; numbers, dates and currency as words;
    English terms via the Saber lexicon.
The lexicon (reels/library/voice/saber_lexicon.pls) is applied locally as text aliases, so nothing changes on the account.
Rules (reels/SYSTEM.md §10): client's own voice only, approved text only, list synthetic lines in delivery notes.
"""
import json, os, re, subprocess, sys, urllib.request, urllib.error
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
LEX = os.path.join(HERE, '..', 'library', 'voice', 'saber_lexicon.pls')
PRESETS = {
    # SG EDIT pickups: match Saber's on-camera, conversational delivery
    'pickup':    dict(stability=.50, similarity=.85, style=.10, speed=1.10),   # Saber talks ~20% faster than the voice's default
    # SG MOTION / explainer voiceover: steadier narration
    'vo':        dict(stability=.65, similarity=.85, style=.10, speed=.97),
    # hooks / promos with more energy (still within the guide's style ceiling)
    'energetic': dict(stability=.42, similarity=.85, style=.20, speed=1.03),
}

argv = sys.argv[1:]; pos, opt, i = [], {}, 0
while i < len(argv):
    if argv[i].startswith('--'):
        if argv[i] == '--no-lexicon': opt['no-lexicon'] = True; i += 1; continue
        opt[argv[i][2:]] = argv[i + 1]; i += 2
    else: pos.append(argv[i]); i += 1
TEXT, OUT = pos[0], pos[1]
P = dict(PRESETS[opt.get('preset', 'pickup')])
for k in ('stability', 'similarity', 'style', 'speed'):
    if k in opt: P[k] = float(opt[k])
MODEL = opt.get('model', 'eleven_v4')
VOICE = opt.get('voice', 'h1dykroatZMMS5JzRfwx')   # "Mohamed Saber" professional clone (ar-egyptian)


def apply_lexicon(text):
    ns = {'p': 'http://www.w3.org/2005/01/pronunciation-lexicon'}
    rules = []
    for lx in ET.parse(LEX).getroot().findall('p:lexeme', ns):
        g = lx.find('p:grapheme', ns).text; a = lx.find('p:alias', ns); ph = lx.find('p:phoneme', ns)
        rep = a.text if a is not None else (f'"/{ph.text}/"' if ph is not None and MODEL.startswith('eleven_v') else None)
        if rep: rules.append((g, rep))
    for g, rep in sorted(rules, key=lambda r: -len(r[0])):        # longest first (Visual Hierarchy before Hierarchy)
        text = re.sub(rf'(?<![A-Za-z]){re.escape(g)}(?![A-Za-z])', rep, text)
    # 'الـ ديزاينرز' -> 'الديزاينرز': the article is read as its own syllable when it stands apart from an Arabic-spelled word
    text = re.sub(r'الـ\s*(?=[\u0600-\u06FF])', 'ال', text)   # also «الـAI» → «الإيه آي»
    return text


spoken = TEXT if opt.get('no-lexicon') else apply_lexicon(TEXT)
key = os.environ.get('ELEVENLABS_API_KEY') or (open(os.environ['ELEVENLABS_API_KEY_FILE']).read().strip() if os.environ.get('ELEVENLABS_API_KEY_FILE') else None)
if not key: sys.exit('set ELEVENLABS_API_KEY (environment secret) or ELEVENLABS_API_KEY_FILE')
payload = {'text': spoken, 'model_id': MODEL, 'language_code': 'ar',
           'voice_settings': {'stability': P['stability'], 'similarity_boost': P['similarity'], 'style': P['style'],
                              'use_speaker_boost': True, 'speed': P['speed']}}
if 'seed' in opt: payload['seed'] = int(opt['seed'])
req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192', data=json.dumps(payload).encode(),
                             method='POST', headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
try:
    mp3 = urllib.request.urlopen(req, timeout=180).read()
except urllib.error.HTTPError as e:
    sys.exit(f'ElevenLabs {e.code}: {e.read()[:400].decode(errors="replace")}')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '-', '-ac', '1', '-ar', '48000', OUT], input=mp3, check=True)
print('wrote', OUT, f'| model {MODEL} | {json.dumps(P)} | sent: {spoken}')

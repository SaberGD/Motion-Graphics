"""Generate speech in Saber's own cloned voice (ElevenLabs) for approved text only.

usage: python3 tts.py "<approved Arabic text>" <out.wav> [--model eleven_v4] [--voice h1dykroatZMMS5JzRfwx]
The key is read from the env var ELEVENLABS_API_KEY, or from the file named by ELEVENLABS_API_KEY_FILE.
It is never written to the repo. Set it as an environment secret (cloud environment settings), not in code.

Rules (reels/SYSTEM.md §10): use only the client's own voice ("Mohamed Saber"), only for text the client approved,
and say in the delivery notes which lines are synthetic. Output is 48 kHz mono WAV, ready for audio.py / the mixer.
"""
import json, os, subprocess, sys, urllib.request, urllib.error

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opt = dict(zip(sys.argv[1::1], sys.argv[2::1]))
TEXT, OUT = args[0], args[1]
MODEL = opt.get('--model', 'eleven_v4')
VOICE = opt.get('--voice', 'h1dykroatZMMS5JzRfwx')   # "Mohamed Saber" professional clone (ar-egyptian)
key = os.environ.get('ELEVENLABS_API_KEY') or (open(os.environ['ELEVENLABS_API_KEY_FILE']).read().strip() if os.environ.get('ELEVENLABS_API_KEY_FILE') else None)
if not key: sys.exit('set ELEVENLABS_API_KEY (environment secret) or ELEVENLABS_API_KEY_FILE')

body = json.dumps({'text': TEXT, 'model_id': MODEL, 'language_code': 'ar',
                   'voice_settings': {'stability': .5, 'similarity_boost': .85, 'style': .25, 'use_speaker_boost': True}}).encode()
req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192', data=body, method='POST',
                             headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
try:
    mp3 = urllib.request.urlopen(req, timeout=120).read()
except urllib.error.HTTPError as e:
    sys.exit(f'ElevenLabs {e.code}: {e.read()[:400].decode(errors="replace")}')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '-', '-ac', '1', '-ar', '48000', OUT], input=mp3, check=True)
print('wrote', OUT, f'({len(TEXT)} chars, model {MODEL})')

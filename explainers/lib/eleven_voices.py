#!/usr/bin/env python3
"""List ElevenLabs voices: your own + shared Arabic (Egyptian) library voices.
usage: python3 explainers/lib/eleven_voices.py [query]"""
import json, sys, urllib.parse, urllib.request, os
sys.path.insert(0, os.path.dirname(__file__))
from tts import eleven_key

def get(url):
    req = urllib.request.Request(url, headers={"xi-api-key": eleven_key()})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

mine = get("https://api.elevenlabs.io/v1/voices")
print("== your voices")
for v in mine.get("voices", []):
    lab = v.get("labels", {})
    print(f'{v["voice_id"]}  {v["name"]:<28} {lab.get("accent","")} {lab.get("gender","")} {lab.get("language","")}')
q = {"language": "ar", "page_size": 40}
if len(sys.argv) > 1: q["search"] = sys.argv[1]
shared = get("https://api.elevenlabs.io/v1/shared-voices?" + urllib.parse.urlencode(q))
print("== shared library (ar)")
for v in shared.get("voices", []):
    print(f'{v["voice_id"]}  {v["name"][:28]:<28} {v.get("accent","")} {v.get("gender","")} {v.get("age","")} {v.get("use_case","")}  {v.get("preview_url","")}')

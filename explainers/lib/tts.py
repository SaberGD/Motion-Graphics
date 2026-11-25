#!/usr/bin/env python3
"""Voice-over + word timings for an explainer.

usage: python3 explainers/lib/tts.py explainers/<video>/

Reads <video>/vo.json, writes <video>/build/vo/<id>.wav and
<video>/build/timeline.json (absolute start/end of every caption word).

vo.json:
  voice, rate            edge-tts voice and speed
  say                    {"DisplayWord": "how TTS should say it"}
  lines[]                {id, text, pad?}  *word* or *two words* = highlighted
  intro, gap, outro      seconds (optional)
"""
import asyncio, json, os, re, subprocess, sys, time
import edge_tts

FFMPEG = os.path.expanduser("~/.local/bin/ffmpeg")
PUNCT = "«»،,.…:؟?!\"'()"


def parse_words(text):
    """Split display text into words, keeping a highlight flag per word."""
    out, hl = [], False
    for raw in text.split():
        starts = raw.startswith("*") or raw.startswith("«*") or raw.startswith("*«")
        if starts:
            hl = True
        word = raw.replace("*", "")
        out.append({"w": word, "hl": hl})
        if raw.rstrip(PUNCT).endswith("*") or raw.endswith("*"):
            hl = False
    return out


def norm(w):
    return w.strip(PUNCT + "*").replace("ّ", "")


async def synth(text, voice, rate, mp3):
    com = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    marks = []
    with open(mp3, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                marks.append({"t": chunk["text"], "s": chunk["offset"] / 1e7,
                              "e": (chunk["offset"] + chunk["duration"]) / 1e7})
    return marks


def eleven_key():
    k = os.environ.get("ELEVENLABS_API_KEY")
    if not k:
        f = os.path.expanduser("~/.config/elevenlabs/api_key")
        if os.path.exists(f):
            k = open(f).read().strip()
    if not k:
        sys.exit("No ElevenLabs key: set ELEVENLABS_API_KEY or write it to ~/.config/elevenlabs/api_key")
    return k


def synth_eleven(text, cfg, mp3):
    """ElevenLabs TTS with character timestamps -> word marks like edge-tts gives."""
    import base64, urllib.request
    body = {"text": text, "model_id": cfg.get("model_id", "eleven_v3")}
    if cfg.get("voice_settings"):
        body["voice_settings"] = cfg["voice_settings"]
    if cfg.get("language_code"):
        body["language_code"] = cfg["language_code"]
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{cfg['voice_id']}/with-timestamps?output_format=mp3_44100_192",
        data=json.dumps(body).encode(), method="POST",
        headers={"xi-api-key": eleven_key(), "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        res = json.load(r)
    open(mp3, "wb").write(base64.b64decode(res["audio_base64"]))
    al = res.get("normalized_alignment") or res["alignment"]
    marks, cur = [], None
    for ch, a, b in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if ch.isspace():
            if cur: marks.append(cur); cur = None
            continue
        if cur is None:
            cur = {"t": ch, "s": a, "e": b}
        else:
            cur["t"] += ch; cur["e"] = b
    if cur: marks.append(cur)
    return marks


def duration(path):
    out = subprocess.run([FFMPEG, "-i", path], capture_output=True, text=True).stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def align(words, marks, dur):
    """Give every display word a start/end from the TTS word marks."""
    mi = 0
    for w in words:
        key = norm(w["say"])
        found = None
        for j in range(mi, min(mi + 4, len(marks))):
            if norm(marks[j]["t"]) == key or key.startswith(norm(marks[j]["t"])) or norm(marks[j]["t"]).startswith(key):
                found = j
                break
        if found is not None:
            w["s"], w["e"] = marks[found]["s"], marks[found]["e"]
            mi = found + 1
    # fill words the TTS split or merged differently
    known = [i for i, w in enumerate(words) if "s" in w]
    for i, w in enumerate(words):
        if "s" in w:
            continue
        prev = max([k for k in known if k < i], default=None)
        nxt = min([k for k in known if k > i], default=None)
        a = words[prev]["e"] if prev is not None else 0.05
        b = words[nxt]["s"] if nxt is not None else dur - 0.1
        w["s"], w["e"] = a, max(a + 0.05, b)
    return words


def main(vdir):
    cfg = json.load(open(os.path.join(vdir, "vo.json"), encoding="utf-8"))
    bdir = os.path.join(vdir, "build", "vo")
    os.makedirs(bdir, exist_ok=True)
    say = cfg.get("say", {})
    t = cfg.get("intro", 0.4)
    gap = cfg.get("gap", 0.35)
    timeline = {"lines": []}
    estimate = "--estimate" in sys.argv
    tempo = float(cfg.get("tempo", 1.0))  # time-stretch without pitch change (ElevenLabs v4 ignores "speed")
    for line in cfg["lines"]:
        words = parse_words(line["text"])
        if estimate:  # layout preview without any voice: ~0.38s per word
            dur = 0.38 * len(words) + 0.2
            for i, w in enumerate(words):
                w["s"], w["e"] = 0.1 + i * 0.38, 0.1 + i * 0.38 + 0.34
            timeline["lines"].append({"id": line["id"], "start": round(t, 3), "dur": round(dur, 3), "wav": None,
                "words": [{"w": w["w"], "hl": w["hl"], "s": round(t + w["s"], 3), "e": round(t + w["e"], 3)} for w in words]})
            t += dur + line.get("pad", gap)
            continue
        for w in words:
            raw = w["w"]
            core = norm(raw)
            if core in say:  # swap only the word itself, keep the punctuation around it (it drives the prosody)
                i = raw.find(core[0]) if core else 0
                pre = raw[:max(i, 0)]
                j = len(raw)
                while j > 0 and raw[j - 1] in PUNCT + "*":
                    j -= 1
                w["say"] = pre + say[core] + raw[j:]
            else:
                w["say"] = raw
        tts_text = " ".join(w["say"].replace("*", "").replace("«", "").replace("»", "").replace("…", "،") for w in words)
        mp3 = os.path.join(bdir, line["id"] + ".mp3")
        wav = os.path.join(bdir, line["id"] + ".wav")
        cache = mp3 + ".json"
        key = json.dumps([tts_text, cfg.get("voice_id"), cfg.get("model_id"), cfg.get("voice_settings"), cfg.get("voice")], ensure_ascii=False)
        cached = json.load(open(cache, encoding="utf-8")) if os.path.exists(cache) and os.path.exists(mp3) else None
        for attempt in range(4):
            try:
                if cached and cached.get("key") == key:
                    marks = cached["marks"]
                    break
                if cfg.get("engine") == "elevenlabs":
                    marks = synth_eleven(tts_text, cfg, mp3)
                    json.dump({"key": key, "marks": marks}, open(cache, "w", encoding="utf-8"), ensure_ascii=False)
                    break
                marks = asyncio.run(synth(tts_text, cfg["voice"], cfg.get("rate", "+0%"), mp3))
                break
            except edge_tts.exceptions.NoAudioReceived:
                if attempt == 3:
                    raise
                time.sleep(2 + attempt * 2)
        subprocess.run([FFMPEG, "-loglevel", "error", "-y", "-i", mp3, "-af", f"atempo={tempo},areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse", "-ar", "48000", "-ac", "1", wav], check=True)
        dur = duration(wav)
        marks = [{"t": m["t"], "s": m["s"] / tempo, "e": m["e"] / tempo} for m in marks]
        words = align(words, marks, dur)
        timeline["lines"].append({
            "id": line["id"], "start": round(t, 3), "dur": round(dur, 3), "wav": wav,
            "words": [{"w": w["w"], "hl": w["hl"], "s": round(t + w["s"], 3), "e": round(t + w["e"], 3)} for w in words],
        })
        print(f'{line["id"]}: {dur:.2f}s  marks={len(marks)} words={len(words)}')
        t += dur + line.get("pad", gap)
    timeline["outro_start"] = round(t, 3)
    timeline["total"] = round(t + cfg.get("outro", 3.2), 3)
    json.dump(timeline, open(os.path.join(vdir, "build", "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("total", timeline["total"])


if __name__ == "__main__":
    main(sys.argv[1])

#!/usr/bin/env python3
"""Builds caption chunks from the timed transcript.

Word times are interpolated inside each transcript line (by character length),
then words are regrouped into short, readable chunks (CHUNKS below).
Outputs: captions.json (used by index.html), ../output/*.srt and *.ass
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT.parent / "source" / "transcript_timed_ar.txt"
OUT = ROOT.parent / "output"

# number of words per caption chunk, in order (max 2 lines on screen)
CHUNKS = [2, 6, 4, 3, 4, 4, 4, 4, 6, 6, 3, 4, 3, 3, 6, 3, 6, 5, 5, 5]

# words shown in the accent colour (Arabic key words -> pink, English terms -> cyan automatically)
KEY_AR = {"تكبير", "حالات", "كتيرة", "عدم", "تماثل", "تراجع", "تحسين", "الشكل", "الأرنبية",
          "الندبات", "تقدم", "العمر", "حجم", "الخطوط", "الرفيعة", "والأهم", "المادة", "الدكتور"}

LATIN = re.compile(r"[A-Za-z]")


def words():
    out = []
    for line in SRC.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s*([\d.]+)\s*-\s*([\d.]+)\s+(.*)", line)
        if not m:
            continue
        a, b, text = float(m[1]), float(m[2]), m[3].split()
        weights = [len(w) + 1 for w in text]
        tot, acc = sum(weights), 0
        for w, k in zip(text, weights):
            s = a + (b - a) * acc / tot
            acc += k
            out.append({"w": w, "s": round(s, 3), "e": round(a + (b - a) * acc / tot, 3)})
    return out


def clean(w):
    return w.rstrip(".،,")


def build():
    ws = words()
    assert sum(CHUNKS) == len(ws), (sum(CHUNKS), len(ws))
    caps, i = [], 0
    for n in CHUNKS:
        grp = ws[i:i + n]
        i += n
        toks = []
        for j, g in enumerate(grp):
            t = clean(g["w"]) if j == n - 1 else g["w"].rstrip("،")
            kind = "en" if LATIN.search(t) else ("key" if clean(t).rstrip("؟") in KEY_AR else "")
            toks.append({"t": t, "k": kind, "s": g["s"]})
        caps.append({"s": grp[0]["s"], "e": grp[-1]["e"], "tokens": toks})
    # each caption stays until the next one starts (small gaps closed), last one held a bit
    for a, b in zip(caps, caps[1:]):
        if b["s"] - a["e"] < 0.35:
            a["e"] = b["s"]
    caps[-1]["e"] = round(caps[-1]["e"] + 0.5, 3)
    return caps


def text(c):
    return " ".join(t["t"] for t in c["tokens"])


def ts(x, sep=","):
    h, r = divmod(x, 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d}{sep}{int(round((s - int(s)) * 1000)):03d}"


def main():
    caps = build()
    (ROOT / "captions.json").write_text(json.dumps(caps, ensure_ascii=False, indent=1), encoding="utf-8")
    OUT.mkdir(exist_ok=True)
    srt = []
    for k, c in enumerate(caps, 1):
        srt += [str(k), f"{ts(c['s'])} --> {ts(c['e'])}", "‫" + text(c) + "‬", ""]
    (OUT / "lip_filler_captions_ar.srt").write_text("\n".join(srt), encoding="utf-8-sig")
    print(f"{len(caps)} captions")
    for c in caps:
        print(f"{c['s']:6.2f}-{c['e']:6.2f}  {text(c)}")


if __name__ == "__main__":
    main()

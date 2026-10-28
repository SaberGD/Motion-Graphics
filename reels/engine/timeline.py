"""Shared timeline helpers: source<->output mapping for jump-cut edits."""
import json, os

FPS = 30


def load_spec(path):
    spec = json.load(open(path))
    spec['_dir'] = os.path.dirname(os.path.abspath(path))
    return spec


def keeps(spec):
    """Source ranges kept, in order: [[s0, e0], [s1, e1], ...]."""
    return spec.get('keep') or [[0, spec['src_dur']]]


def out_duration(spec):
    return sum(e - s for s, e in keeps(spec)) + spec.get('outro', {}).get('dur', 0)


def speech_duration(spec):
    return sum(e - s for s, e in keeps(spec))


def src_to_out(spec, t):
    """Map a source time to the output timeline (None if it was cut)."""
    acc = 0
    for s, e in keeps(spec):
        if s <= t <= e:
            return acc + t - s
        acc += e - s
    return None


def out_to_src(spec, t):
    acc = 0
    for s, e in keeps(spec):
        if t < acc + e - s:
            return s + t - acc
        acc += e - s
    s, e = keeps(spec)[-1]
    return e


def cut_points(spec):
    """Output times where two kept ranges meet (jump cuts)."""
    out, acc = [], 0
    for s, e in keeps(spec)[:-1]:
        acc += e - s
        out.append(round(acc, 3))
    return out


def out_words(spec, words):
    """Words remapped to the output timeline; words inside cut ranges are dropped."""
    res = []
    for w in words:
        mid = (w['s'] + w['e']) / 2
        if src_to_out(spec, mid) is None:
            continue
        s = src_to_out(spec, w['s']); e = src_to_out(spec, w['e'])
        if s is None: s = src_to_out(spec, mid) - .05
        if e is None: e = src_to_out(spec, mid) + .05
        res.append(dict(w, s=round(s, 3), e=round(e, 3)))
    return res

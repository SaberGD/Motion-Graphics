"""Resolve a reel spec: output durations + transcript remapped to the output timeline (with text fixes applied)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from timeline import load_spec, out_duration, speech_duration, out_words

spec = load_spec(sys.argv[1]); outdir = sys.argv[2]
words = json.load(open(os.path.join(spec['_dir'], spec['words'])))
for i, w in enumerate(words): w['i'] = i
spec['_dur'] = round(out_duration(spec), 3); spec['_speech'] = round(speech_duration(spec), 3)
ow = out_words(spec, words)
# caption config refers to source word indices; renderer chunks by those indices
json.dump(spec, open(os.path.join(outdir, 'spec.json'), 'w'), ensure_ascii=False)
json.dump(ow, open(os.path.join(outdir, 'words.json'), 'w'), ensure_ascii=False)
print('dur', spec['_dur'], 'speech', spec['_speech'], 'words', len(ow))

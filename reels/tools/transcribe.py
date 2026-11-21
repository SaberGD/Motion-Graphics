"""Word-level Egyptian-Arabic transcript (faster-whisper large-v3). usage: transcribe.py <audio16k.wav> <out.json>"""
import json, sys, librosa
from faster_whisper import WhisperModel

# Egyptian-dialect priming keeps Whisper from "translating" the speech into MSA
PROMPT = ('بص يا سيدي، مش المشكلة إن التصميم معمول بالـ AI، المشكلة إنه باين. الشركات دلوقتي محتاجة Designer '
          'فاهم الـ Brand والـ Audience بتاعه. عشان كده قبل ما تفكر في اللون والخط، هتلاقيه في أول كومنت.')
m = WhisperModel('large-v3', device='cpu', compute_type='int8', cpu_threads=4)
for wav, out in zip(sys.argv[1::2], sys.argv[2::2]):
    audio = librosa.load(wav, sr=16000)[0]
    segs, _ = m.transcribe(audio, language='ar', word_timestamps=True, beam_size=5, vad_filter=True,
                           vad_parameters=dict(min_silence_duration_ms=300), initial_prompt=PROMPT,
                           condition_on_previous_text=False)
    words = [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2)} for s in segs for w in s.words]
    json.dump(words, open(out, 'w'), ensure_ascii=False, indent=0)
    print(out, ' '.join(w['w'] for w in words), flush=True)

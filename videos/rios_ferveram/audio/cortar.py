# Corta take1.wav em 12 falas (pelas palavras do Whisper), comprime pausas internas, acelera e junta com respiro.
import json, subprocess, re
W = json.load(open('/tmp/claude-0/wh/w1.json'))
ini = ["No dia", "Tudo começou", "Lá no", "pelos rios", "Os glóbulos brancos", "As plaquetas", "E no ponto", "Até que um", "Começou a", "Até que do", "Desde esse", "e que talvez"]
_x = ["No dia", "Tudo começou", "Lá no", "pelos rios", "Os glóbulos", "As plaquetas", "E no", "que um", "Começou a", "que do", "Desde esse", "e que"]
txt = [re.sub(r'[^\wà-ú]', '', w['text'].lower()) for w in W]
starts = []; k = 0
for p in ini:
    ws = [re.sub(r'[^\wà-ú]', '', x.lower()) for x in p.split()]
    while txt[k:k+len(ws)] != ws: k += 1
    starts.append(k); k += 1
seg = []
for i, s in enumerate(starts):
    e = (starts[i+1] if i+1 < len(starts) else len(W)) - 1
    t0 = W[s]['timestamp'][0] - 0.12; t1 = W[e]['timestamp'][1] + 0.35
    if i+1 < len(starts): t1 = min(t1, W[starts[i+1]]['timestamp'][0] - 0.1)
    seg.append((round(t0, 2), round(t1, 2)))
import wave, numpy as np
_w = wave.open("take1.wav"); SR = _w.getframerate(); X = np.frombuffer(_w.readframes(_w.getnframes()), np.int16)
def comprime(a, b, out, maxp=0.42, thr=10**(-42/20)):
    x = X[int(a*SR):int(b*SR)].astype(float) / 32768; h = int(SR*0.01)
    rms = np.array([np.sqrt(np.mean(x[i:i+h]**2)) for i in range(0, len(x), h)])
    keep = np.ones(len(rms), bool); run = 0; mp = int(maxp/0.01)
    for i, r in enumerate(rms):
        run = run + 1 if r < thr else 0
        if run > mp: keep[i] = False
    y = np.concatenate([x[i*h:(i+1)*h] for i in range(len(rms)) if keep[i]])
    with wave.open(out, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y*32767).astype(np.int16).tobytes())
GAP = 0.55; TEMPO = 1.1; tl = []; t = 0.0; partes = []
for i, (a, b) in enumerate(seg):
    o = f"f{i+1:02d}.wav"
    comprime(a, b, "tmp.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "tmp.wav", "-af", f"atempo={TEMPO},afade=t=in:d=0.03", "-ar", "48000", o], check=True)
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", o]))
    tl.append({"i": i+1, "ini": round(t, 3), "dur": round(d, 3)}); t += d + GAP; partes.append(o)
json.dump(tl, open("tl.json", "w"), indent=1)
print(seg); print(tl); print("total", round(t, 2))

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
import subprocess as _sp
_o = _sp.run(["ffmpeg", "-i", "take1.wav", "-af", "silencedetect=n=-40dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
_ss = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', _o)]; _se = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', _o)]
SIL = list(zip(_ss, _se))
def silencio_antes(t):  # silêncio que termina mais perto (antes ou logo depois) do início da palavra
    return min(SIL, key=lambda p: abs(p[1] - t))
seg = []
for i, s in enumerate(starts):
    e = (starts[i+1] if i+1 < len(starts) else len(W)) - 1
    a0, b0 = silencio_antes(W[s]['timestamp'][0]); t0 = max(a0, b0 - 0.1) if i else max(0, W[s]['timestamp'][0] - 0.12)
    if i+1 < len(starts): a1, b1 = silencio_antes(W[starts[i+1]]['timestamp'][0]); t1 = min(a1 + 0.2, b1 - 0.1)
    else: t1 = W[e]['timestamp'][1] + 0.35
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

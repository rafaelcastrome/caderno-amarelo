# Corta um take nas falas usando o Whisper (palavras com tempo) alinhado ao texto. uso: cortar2.py take (sem .wav) primeiro_numero
import json, sys, subprocess, difflib, unicodedata
take, n0 = sys.argv[1], int(sys.argv[2])
norm = lambda s: ''.join(ch for ch in unicodedata.normalize('NFD', s.lower()) if ch.isalnum())
NUM = {'10': 'dez', '12': 'doze', '13': 'treze', '14': 'catorze', 'toque': 'toc', 'para': 'pra', 'esta': 'ta', 'estava': 'tava'}
P = [p.strip() for p in open(f'falas/{take}.txt', encoding='utf-8').read().split('\n\n') if p.strip()]
W = json.load(open(f'falas/{take}_w.json'))
wn = [NUM.get(norm(x['w']), norm(x['w'])) for x in W]
sw, dono = [], []
for i, p in enumerate(P):
    for w in p.split(): sw.append(NUM.get(norm(w), norm(w))); dono.append(i)
sm = difflib.SequenceMatcher(None, sw, wn, autojunk=False); m = {}
for a, b, n in sm.get_matching_blocks():
    for k in range(n): m[a + k] = b + k
dur = float(subprocess.run(['ffprobe', '-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'falas/{take}.wav'], capture_output=True, text=True).stdout)
cortes = [0.0]
for i in range(1, len(P)):
    ini = dono.index(i); a = next(m[k] for k in range(ini, len(sw)) if k in m)            # 1ª palavra casada da fala i
    b = next(m[k] for k in range(ini - 1, -1, -1) if k in m)                             # última casada da anterior
    fa, fb = W[a]['a'], W[b]['b'] or W[b]['a']
    cortes.append((fa + fb) / 2 if fa > fb else fa - 0.05)
cortes.append(dur)
F = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,afade=t=in:d=0.04,areverse,afade=t=in:d=0.02'
for k in range(len(P)):
    out = f'falas/c{n0 + k:02d}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{cortes[k]:.3f}', '-to', f'{cortes[k + 1]:.3f}', '-i', f'falas/{take}.wav', '-af', F, out], check=True)
    print(out, round(cortes[k], 2), round(cortes[k + 1], 2), P[k][:50])

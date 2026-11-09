# envelope de boca (0..1, 30 por s) de cada fala -> bocas.json
import json, subprocess, numpy as np, sys
F = '../falas/p1/'
out = {}
for nome in ['a0', 'a7']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', F + nome + '.wav', '-ac', '1', '-ar', '16000', '-af', 'bandpass=f=1000:w=1800', '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32); n = 16000 // 30
    e = np.array([np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, len(x) - n, n)])
    e = np.clip(e / (np.percentile(e, 95) + 1e-9), 0, 1) ** 0.7
    e[e < 0.12] = 0
    out[nome] = {'fps': 30, 'v': [round(float(v), 3) for v in e]}
json.dump(out, open('bocas.json', 'w'))
print({k: len(v['v']) for k, v in out.items()})

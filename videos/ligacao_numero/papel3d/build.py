# Teste em papel recortado 3D (skill video-papel-recortado-codigo) em 1ª pessoa. uso: python3 build.py [--prev A t1 t2 | B t1 t2]
import json, os, subprocess, sys, wave
import numpy as np
R = os.path.dirname(os.path.abspath(__file__)); V = f"{R}/../.."
def env(arq, ini, D):
    w = wave.open(arq); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; sr = w.getframerate()
    n = int(D * 30) + 2; out = np.zeros(n); h = sr // 30
    for i in range(n):
        j = int((i / 30 - ini) * sr)
        if 0 <= j and j + h <= len(x): out[i] = np.sqrt(np.mean(x[j:j + h] ** 2))
    out = np.clip(out / 0.12, 0, 1) ** 0.7
    for i in range(1, n): out[i] = max(out[i], out[i - 1] * 0.55)
    return list(out.round(3))
CENAS = {"A": (10.72, {"mae": (f"{R}/../falas/p1/a0.wav", 0.0)}), "B": (10.28, {"tel": (f"{R}/../falas/p1/a4.wav", 16.444 - 10.72)})}
def js(k):
    D, bocas = CENAS[k]
    boca = {n: env(a, i, D) for n, (a, i) in bocas.items()}
    src = (f"window.BOCA = {json.dumps(boca)};\n" + open(f"{V}/duas_bombas/lib.js").read() + "\n" + open(f"{V}/garota_ceu/ator.js").read() + "\n" +
           open(f"{R}/pov.js").read() + "\n" + open(f"{R}/cena{k}.js").read() +
           f"\nwindow.CENA = (P) => {{ const L = window.LIB(P); window.ATOR(P, L); const V = window.POV(P, L); window.CENA_{k}(P, L, V, {D}); return {{ dur: {D} }}; }};\n")
    os.makedirs(f"{R}/build", exist_ok=True); p = f"{R}/build/cena{k}.js"; open(p, "w").write(src); return p
if __name__ == "__main__":
    a = sys.argv[1:]
    if a and a[0] == "--prev":
        k = a[1]; r = subprocess.run(["node", f"{V}/_papel3d/render.js", js(k), f"{R}/build/{k}.mp4", "--prev"] + a[2:], capture_output=True, text=True); print(r.stdout[-300:], r.stderr[-1500:])
    else:
        ps = [subprocess.Popen(["node", f"{V}/_papel3d/render.js", js(k), f"{R}/build/{k}.mp4"], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True) for k in (a or ["A", "B"])]
        for p in ps: print(p.communicate()[1][-800:])

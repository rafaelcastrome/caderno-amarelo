# Monta cenas/fNN.js (lib + ator + clipe + cenas + boca) e renderiza flow/fNN.mp4.
# uso: python3 build.py [--prev t1 t2 ...] [cenas...]
import json, os, subprocess, sys, wave
import numpy as np
from concurrent.futures import ThreadPoolExecutor
R = os.path.dirname(os.path.abspath(__file__)); A = f"{R}/audio"; V = f"{R}/.."
CENAS = [
 (7.6, [("C1", 0.6, "clipe")]),
 (7.0, [("C2", 1.3, "clipe")]),
 (5.2, [("C3", 0.7, "clipe")]),
 (11.8, [("E1", 0.4, "chefe"), ("C4", 6.0, "clipe"), ("E2", 9.5, "chefe")]),
 (4.4, [("C5", 0.7, "clipe")]),
 (18.8, [("P1", 1.3, "copilot"), ("X1", 9.4, "clipe"), ("C6", 13.7, "clipe")]),
 (2.6, [("C7", 0.6, "clipe")]),
]
def env(nome, ini, D):
    w = wave.open(f"{A}/{nome}.wav"); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; sr = w.getframerate()
    n = int(D * 30) + 2; out = np.zeros(n); h = sr // 30
    for i in range(n):
        j = int((i / 30 - ini) * sr)
        if 0 <= j and j + h <= len(x): out[i] = np.sqrt(np.mean(x[j:j + h] ** 2))
    out = np.clip(out / 0.12, 0, 1) ** 0.7
    sm = np.copy(out)
    for i in range(1, n): sm[i] = max(out[i], sm[i - 1] * 0.55)
    return sm
if __name__ == "__main__":
    args = sys.argv[1:]; prev = None
    if "--prev" in args: k = args.index("--prev"); prev = [a for a in args[k + 1:] if "." in a]; args = args[:k] + [a for a in args[k + 1:] if a.isdigit()]
    so = [int(a) for a in args if a.isdigit()]
    base = "".join(open(f).read() + "\n" for f in [f"{V}/duas_bombas/lib.js", f"{V}/duas_bombas/filme/ator.js", f"{R}/clipe.js", f"{R}/cenas.js"])
    os.makedirs(f"{R}/cenas", exist_ok=True); os.makedirs(f"{R}/flow", exist_ok=True)
    def faz(i):
        D, falas = CENAS[i]; boca = {}
        for nome, ini, quem in falas:
            if quem: e = env(nome, ini, D); boca[quem] = list(np.maximum(np.array(boca.get(quem, [0] * len(e))), e).round(3))
        js = f"{R}/cenas/f{i+1:02d}.js"
        open(js, "w").write(f"window.BOCA = {json.dumps(boca)};\n" + base +
            f"\nwindow.CENA = (P) => {{ const L = window.LIB(P); window.ATOR(P, L); window.CLIPE(P, L); const D = {D}; window.EP[{i}](P, L, D); return {{ dur: D }}; }};\n")
        out = f"{R}/flow/f{i+1:02d}.mp4"
        cmd = ["node", f"{V}/_papel3d/render.js", js, out] + (["--prev"] + prev if prev else [])
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode or "ERRO" in r.stderr or "JS:" in r.stderr: print(i + 1, r.stderr[-800:])
        if not prev: subprocess.run(["python3", f"{V}/_papel3d/sfx_papel.py", out.replace(".mp4", ".json")], capture_output=True)
        return i + 1
    idx = [k - 1 for k in so] if so else range(len(CENAS))
    with ThreadPoolExecutor(4) as ex: print(list(ex.map(faz, idx)))

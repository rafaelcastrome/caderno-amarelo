# Filme parte 2: monta cenas/fNN.js (lib + ator + cenas.js + boca da fala) e renderiza.
# uso: python3 build.py [--prev t1 t2 ...] [cenas...]   (sem número = todas)
import json, os, subprocess, sys, wave
import numpy as np
from concurrent.futures import ThreadPoolExecutor
R = os.path.dirname(os.path.abspath(__file__)); A = f"{R}/audio"
# duração e falas de cada cena: (arquivo, início na cena, personagem que mexe a boca ou None)
CENAS = [
 (9.0, [("N1", 0.5, None)]),
 (14.8, [("E1", 2.8, "esposa"), ("T1", 9.4, "tsutomu")]),
 (7.0, [("N2", 0.5, None)]),
 (9.2, [("C1", 0.6, "chefe"), ("T2", 4.7, "tsutomu")]),
 (8.2, [("C2", 0.4, "chefe")]),
 (4.8, [("N3", 0.6, None)]),
 (7.2, [("T3", 0.5, "tsutomu")]),
 (7.0, [("N4", 0.8, None)]),
 (4.6, [("N5", 0.8, None)]),
 (5.4, [("N6", 1.0, None)]),
 (7.6, [("N7", 0.6, None)]),
]
def env(nome, ini, D):
    w = wave.open(f"{A}/{nome}.wav"); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; sr = w.getframerate()
    n = int(D * 30) + 2; out = np.zeros(n); h = sr // 30
    for i in range(n):
        j = int((i / 30 - ini) * sr)
        if 0 <= j < len(x): out[i] = np.sqrt(np.mean(x[j:j + h] ** 2)) if j + h <= len(x) else 0
    out = np.clip(out / 0.12, 0, 1) ** 0.7
    sm = np.copy(out)
    for i in range(1, n): sm[i] = max(out[i], sm[i - 1] * 0.55)  # fecha devagar
    return sm
if __name__ == "__main__":
    args = sys.argv[1:]; prev = None
    if "--prev" in args: k = args.index("--prev"); prev = [a for a in args[k + 1:] if not a.isdigit() or "." in a]; args = args[:k] + [a for a in args[k + 1:] if a.isdigit() and "." not in a]
    so = [int(a) for a in args if a.isdigit()]
    lib = open(f"{R}/../lib.js").read(); ator = open(f"{R}/../filme/ator.js").read(); ep = open(f"{R}/cenas.js").read()
    os.makedirs(f"{R}/cenas", exist_ok=True); os.makedirs(f"{R}/flow", exist_ok=True)
    def faz(i):
        D, falas = CENAS[i]; boca = {}
        for nome, ini, quem in falas:
            if quem: e = env(nome, ini, D); boca[quem] = list(np.maximum(np.array(boca.get(quem, [0] * len(e))), e).round(3))
        js = f"{R}/cenas/f{i+1:02d}.js"
        open(js, "w").write(f"window.BOCA = {json.dumps(boca)};\n" + lib + "\n" + ator + "\n" + ep +
            f"\nwindow.CENA = (P) => {{ const L = window.LIB(P); window.ATOR(P, L); const D = {D}; window.EP[{i}](P, L, D); return {{ dur: D }}; }};\n")
        out = f"{R}/flow/f{i+1:02d}.mp4"
        cmd = ["node", f"{R}/../../_papel3d/render.js", js, out] + (["--prev"] + prev if prev else [])
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode or "ERRO" in r.stderr or "JS:" in r.stderr: print(i + 1, r.stderr[-800:])
        if not prev: subprocess.run(["python3", f"{R}/../../_papel3d/sfx_papel.py", out.replace(".mp4", ".json")], capture_output=True)
        return i + 1
    idx = [k - 1 for k in so] if so else range(len(CENAS))
    with ThreadPoolExecutor(4) as ex: print(list(ex.map(faz, idx)))

# Ep. 4 "Voz de gente": monta cenas/fNN.js (lib + ator + lib_juli + cenas.js) e renderiza flow/fNN.mp4.
# uso: python3 build.py [--prev t1 t2 ...] [cenas...]   (sem número = todas)
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
R = os.path.dirname(os.path.abspath(__file__))
# (duração da cena, [(fala do narrador, início na cena)])
CENAS = [
 (5.7, [("N1", 0.5)]), (4.5, [("N2", 0.5)]), (2.6, [("N3", 0.8)]), (10.1, [("N4", 0.4)]), (6.0, [("N5", 0.5)]),
 (6.4, [("N6", 0.4)]), (7.0, [("N7", 0.4)]), (3.2, [("N8", 0.5)]), (11.6, [("N9", 0.5)]), (3.8, [("N10", 0.5)]),
 (9.6, [("N11", 0.4)]), (3.7, [("N12", 0.5)]), (6.5, [("N13", 0.5)]), (13.5, [("N14", 0.6)]),
]
if __name__ == "__main__":
    args = sys.argv[1:]; prev = None
    if "--prev" in args: k = args.index("--prev"); prev = [a for a in args[k + 1:] if "." in a]; args = args[:k] + [a for a in args[k + 1:] if "." not in a]
    so = [int(a) for a in args if a.isdigit()]
    lib = open(f"{R}/../../duas_bombas/lib.js").read(); ator = open(f"{R}/../ator.js").read(); juli = open(f"{R}/../lib_juli.js").read(); ep = open(f"{R}/cenas.js").read()
    os.makedirs(f"{R}/cenas", exist_ok=True); os.makedirs(f"{R}/flow", exist_ok=True)
    def faz(i):
        D = CENAS[i][0]; js = f"{R}/cenas/f{i+1:02d}.js"
        open(js, "w").write("window.BOCA = {};\n" + lib + "\n" + ator + "\n" + juli + "\n" + ep +
            f"\nwindow.CENA = (P) => {{ const L = window.LIB(P); window.ATOR(P, L); window.JULI(P, L); const D = {D}; window.EP[{i}](P, L, D); return {{ dur: D }}; }};\n")
        out = f"{R}/flow/f{i+1:02d}.mp4"
        r = subprocess.run(["node", f"{R}/../../_papel3d/render.js", js, out] + (["--prev"] + prev if prev else []), capture_output=True, text=True)
        if r.returncode or "ERRO" in r.stderr or "JS:" in r.stderr: print(i + 1, r.stderr[-600:])
        return i + 1
    idx = [k - 1 for k in so] if so else range(len(CENAS))
    with ThreadPoolExecutor(4) as ex: print(list(ex.map(faz, idx)))

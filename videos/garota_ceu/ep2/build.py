# Ep. 2 "Sozinha": monta cenas/fNN.js (lib + ator + lib_juli + cenas.js) e renderiza flow/fNN.mp4.
# uso: python3 build.py [--prev t1 t2 ...] [cenas...]   (sem número = todas)
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
R = os.path.dirname(os.path.abspath(__file__))
# (duração da cena, [(fala do narrador, início na cena)])
CENAS = [
 (6.3, [("N1", 0.5)]), (5.1, [("N2", 0.4)]), (5.4, [("N3", 0.4)]), (4.1, [("N4", 0.4)]), (2.9, [("N5", 0.4)]),
 (4.4, [("N6", 0.4)]), (7.2, [("N7", 0.4)]), (7.0, [("N8", 0.4)]), (9.2, [("N9", 0.4)]), (5.0, [("N10", 0.4)]),
 (3.6, [("N11", 1.0)]), (4.3, [("N12", 0.4)]), (2.1, [("N13", 0.3)]), (8.1, [("N14", 0.5)]),
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
        if i + 1 == 4 and not prev:  # ponto de vista sem óculos: os 2 primeiros segundos borrados
            tmp = out.replace(".mp4", "_b.mp4")
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", out, "-vf", "gblur=sigma=16:enable='lt(t,2)'", "-c:v", "libx264", "-crf", "18", "-an", tmp], check=True); os.replace(tmp, out)
        return i + 1
    idx = [k - 1 for k in so] if so else range(len(CENAS))
    with ThreadPoolExecutor(4) as ex: print(list(ex.map(faz, idx)))

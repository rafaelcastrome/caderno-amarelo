# Gera cenas/epN_cenaKK.js (lib + epN + rodapé com a duração da cena) e renderiza.
# uso: python3 build.py N [--prev] [cenas...]
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
R = os.path.dirname(os.path.abspath(__file__)); E = int(sys.argv[1]); prev = '--prev' in sys.argv
so = [int(a) for a in sys.argv[2:] if a.isdigit()]
tl = json.load(open(f"{R}/ep{E}/timeline.json"))["cenas"]
lib = open(f"{R}/lib.js").read(); ep = open(f"{R}/ep{E}.js").read()
os.makedirs(f"{R}/cenas", exist_ok=True); os.makedirs(f"{R}/ep{E}/flow", exist_ok=True)
def faz(i):
    c = tl[i]; D = round(c["end"] - c["start"], 3)
    js = f"{R}/cenas/ep{E}_cena{i+1:02d}.js"
    open(js, "w").write(lib + "\n" + ep + f"\nwindow.CENA = (P) => {{ const L = window.LIB(P); const D = {D}; window.EP[{i}](P, L, D); return {{ dur: D }}; }};\n")
    out = f"{R}/ep{E}/flow/cena{i+1:02d}.mp4"
    cmd = ["node", f"{R}/../_papel3d/render.js", js, out] + (["--prev", f"{D*0.25:.2f}", f"{D*0.95:.2f}"] if prev else [])
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode or "ERRO" in r.stderr: print(i + 1, r.stderr[-600:])
    if not prev:
        subprocess.run(["python3", f"{R}/../_papel3d/sfx_papel.py", out.replace(".mp4", ".json")], capture_output=True)
    return i + 1
idx = [k - 1 for k in so] if so else range(len(tl))
with ThreadPoolExecutor(4) as ex: print(list(ex.map(faz, idx)))

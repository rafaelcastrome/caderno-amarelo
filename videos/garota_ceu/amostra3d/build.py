# Amostra 3D: python3 build.py 1:6.0 2:7.0 3:5.0 [--prev t1 t2]
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
R = os.path.dirname(os.path.abspath(__file__)); G = f"{R}/.."; M = f"{G}/../_cena3d"
args = sys.argv[1:]; prev = None
if "--prev" in args: k = args.index("--prev"); prev = args[k + 1:]; args = args[:k]
base = "".join(open(f).read() + "\n" for f in [f"{M}/gente3d.js", f"{M}/cenario3d.js", f"{G}/fichas3d.js", f"{R}/cenas.js"])
os.makedirs(f"{R}/cenas", exist_ok=True); os.makedirs(f"{R}/flow", exist_ok=True)
def faz(a):
    i, D = a.split(":"); i = int(i); nome = f"a{i:02d}"; js = f"{R}/cenas/{nome}.js"
    open(js, "w").write("window.BOCA = {};\n" + base + f"\nwindow.CENA = (P) => {{ const L = {{}}; window.GENTE(P, L); window.CEN3D(P, L); window.FICHAS(P, L); const D = {D}; window.EP[{i-1}](P, L, D); return {{ dur: D }}; }};\n")
    r = subprocess.run(["node", f"{M}/render3d.js", js, f"{R}/flow/{nome}.mp4"] + (["--prev"] + prev if prev else []), capture_output=True, text=True)
    if r.returncode or "ERRO" in r.stderr or "JS:" in r.stderr: print(nome, r.stderr[-800:])
    return nome
with ThreadPoolExecutor(3) as ex: print(list(ex.map(faz, args)))

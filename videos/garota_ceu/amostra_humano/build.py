# Amostra do corpo "de gente": renderiza cenas de episódios existentes trocando o boneco (humano.js).
# uso: python3 build.py ep1:5:5.6 ep2:7:7.2 ... [--prev t1 t2]
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
R = os.path.dirname(os.path.abspath(__file__)); G = f"{R}/.."
args = sys.argv[1:]; prev = None
if "--prev" in args: k = args.index("--prev"); prev = args[k + 1:]; args = args[:k]
lib = open(f"{G}/../duas_bombas/lib.js").read(); ator = open(f"{G}/ator.js").read(); hum = open(f"{G}/humano.js").read(); juli = open(f"{G}/lib_juli.js").read() + "\n" + open(f"{G}/cenario_real.js").read()
os.makedirs(f"{R}/cenas", exist_ok=True); os.makedirs(f"{R}/flow", exist_ok=True)
def faz(a):
    ep, i, D = a.split(":"); i = int(i); ep_js = open(f"{G}/{ep}/cenas.js" if ep != "amostra" else f"{R}/cenas.js").read()
    nome = f"{ep}_{i:02d}"; js = f"{R}/cenas/{nome}.js"
    open(js, "w").write("window.BOCA = window.BOCA || {};\n" + lib + "\n" + ator + "\n" + hum + "\n" + juli + "\n" + ep_js +
        f"\nwindow.CENA = (P) => {{ const L = window.LIB(P); window.ATOR(P, L); window.HUMANO(P, L); window.JULI(P, L); window.REAL(P, L); const D = {D}; window.EP[{i-1}](P, L, D); return {{ dur: D }}; }};\n")
    r = subprocess.run(["node", f"{G}/../_papel3d/render.js", js, f"{R}/flow/{nome}.mp4"] + (["--prev"] + prev if prev else []), capture_output=True, text=True)
    if r.returncode or "ERRO" in r.stderr or "JS:" in r.stderr: print(nome, r.stderr[-800:])
    return nome
with ThreadPoolExecutor(4) as ex: print(list(ex.map(faz, args)))

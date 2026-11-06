# Monta a prévia do filme: clipes + vozes nos tempos certos + efeitos + papel + títulos, legendas das falas e @ andando.
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from build import CENAS
R = os.path.dirname(os.path.abspath(__file__)); W, H, FPS = 720, 1280, 30
fnt = lambda s: ImageFont.truetype(f"{R}/../Caveat-Bold.ttf", s)
ini = list(np.cumsum([0] + [c[0] for c in CENAS])); TOT = ini[-1]
TXT = {1: "O HOMEM DAS DUAS BOMBAS\nPARTE 1", 2: "Hiroshima, 1945", 5: "6 de agosto · 8h15", 9: "3 km da bomba"}
FALA = {"A1": "Yamaguchi! Bora, que o trem não espera!", "T1": "Três meses longe de casa...\nhoje eu finalmente volto!",
        "T2": "Ih... esqueci meu carimbo\nlá no estaleiro!", "A2": "Vai lá buscar.\nA gente te espera na estação!", "T3": "Que avião é esse lá em cima?"}
run = subprocess.check_call
def etiqueta(txt, size, fundo=(255, 253, 244, 245)):
    fo = fnt(size); lines = txt.split("\n"); dd = ImageDraw.Draw(Image.new("L", (1, 1)))
    tw = max(dd.textbbox((0, 0), l, font=fo)[2] for l in lines); lh = int(size * 1.08); pad = 22
    im = Image.new("RGBA", (tw + 2 * pad + 10, lh * len(lines) + 2 * pad + 14), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([8, 12, im.width - 1, im.height - 1], 24, fill=(0, 0, 0, 80))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(7))); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, im.width - 10, im.height - 14], 24, fill=fundo, outline=(40, 40, 40, 255), width=4)
    for j, l in enumerate(lines): d.text(((im.width - 10) // 2, pad + j * lh + lh // 2 - 2), l, font=fo, fill=(200, 45, 35, 255) if j == 0 and len(lines) > 1 else (35, 35, 35, 255), anchor="mm")
    return im
def legenda(txt, quem):
    fo = fnt(46); lines = txt.split("\n"); lh = 52; dd = ImageDraw.Draw(Image.new("L", (1, 1)))
    tw = max(dd.textbbox((0, 0), l, font=fo)[2] for l in lines); im = Image.new("RGBA", (tw + 40, lh * len(lines) + 60), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.text((im.width // 2, 14), quem, font=fnt(32), fill=(255, 214, 90, 255), anchor="mm", stroke_width=4, stroke_fill=(20, 20, 20, 255))
    for j, l in enumerate(lines): d.text((im.width // 2, 34 + j * lh + lh // 2), l, font=fo, fill=(255, 255, 255, 255), anchor="mm", stroke_width=5, stroke_fill=(20, 20, 20, 255))
    return im
WM = etiqueta("@Cardeno_Amarelo", 30); LAB = {k: etiqueta(v, 50 if "\n" in v else 56) for k, v in TXT.items()}
SUB = []  # (t0, t1, imagem)
for c, (D, falas) in enumerate(CENAS, 1):
    for nome, t, quem in falas:
        if nome in FALA:
            d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{R}/audio/{nome}.wav"]))
            SUB.append((ini[c - 1] + t, ini[c - 1] + t + d + 0.2, legenda(FALA[nome], "TSUTOMU" if quem == "tsutomu" else "AKIRA")))
# 1) vídeo e som de papel
lv, la = [], []
for i, (D, _) in enumerate(CENAS, 1):
    lv.append(f"file '{R}/flow/f{i:02d}.mp4'"); wav = f"{R}/flow/f{i:02d}.wav"; o = f"{R}/tmp_s{i}.wav"
    src = ["-i", wav] if os.path.exists(wav) else ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]
    run(["ffmpeg", "-y", "-v", "error", *src, "-af", f"aresample=44100,apad,atrim=0:{D:.3f}", "-ac", "2", o]); la.append(f"file '{o}'")
open(f"{R}/tmp_v.txt", "w").write("\n".join(lv)); open(f"{R}/tmp_a.txt", "w").write("\n".join(la))
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", f"{R}/tmp_v.txt", "-c", "copy", f"{R}/tmp_v.mp4"])
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", f"{R}/tmp_a.txt", f"{R}/tmp_papel.wav"])
# vozes nos tempos certos
ins, flt = [], []
for c, (D, falas) in enumerate(CENAS, 1):
    for nome, t, quem in falas:
        ins += ["-i", f"{R}/audio/{nome}.wav"]; ms = int((ini[c - 1] + t) * 1000); k = len(flt)
        flt.append(f"[{k}:a]aresample=44100,pan=stereo|c0=c0|c1=c0,adelay={ms}|{ms}[v{k}]")
n = len(flt)
fc = ";".join(flt) + ";" + "".join(f"[v{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0:duration=longest,apad,atrim=0:{TOT:.3f}[voz];" + \
     f"[{n}:a]volume=0.22[p];[{n+1}:a]volume=0.8[s];[voz][p][s]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.95"
run(["ffmpeg", "-y", "-v", "error", *ins, "-i", f"{R}/tmp_papel.wav", "-i", f"{R}/audio/sfx_filme.wav", "-filter_complex", fc, "-ac", "2", f"{R}/tmp_mix.wav"])
# 2) textos por cima
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{R}/tmp_v.mp4", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
out = f"{R}/tmp_final.mp4"
enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", f"{R}/tmp_mix.wav",
    "-c:v", "libx264", "-crf", "27", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-af", "loudnorm=I=-15:TP=-1.5", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
fr = 0
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    t = fr / FPS; im = Image.frombytes("RGB", (W, H), b).convert("RGBA")
    c = next((i for i in range(1, len(CENAS) + 1) if ini[i - 1] <= t < ini[i]), len(CENAS))
    if c in LAB and t - ini[c - 1] < CENAS[c - 1][0] - 0.2:
        lab = LAB[c]; k = min(1, (t - ini[c - 1]) / 0.25); s = 0.6 + 0.4 * k
        l2 = lab.resize((max(1, int(lab.width * s)), max(1, int(lab.height * s)))); im.alpha_composite(l2, ((W - l2.width) // 2, 105 - (l2.height - lab.height) // 2))
    for a, z, img in SUB:
        if a <= t < z: im.alpha_composite(img, ((W - img.width) // 2, H - 330))
    x = int((W - WM.width) / 2 + math.sin(t * 0.35) * 200); im.alpha_composite(WM, (x, H - 120))
    enc.stdin.write(im.convert("RGB").tobytes()); fr += 1
enc.stdin.close(); enc.wait()
os.replace(out, f"{R}/previa_filme_parte1.mp4")
for p in os.listdir(R):
    if p.startswith("tmp_"): os.remove(f"{R}/{p}")
print("ok", fr / FPS)

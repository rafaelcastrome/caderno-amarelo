# Monta o Ep. 2: clipes + voz nos tempos certos + trilha (abaixando sob a voz) + etiquetas, legendas da narração, cartão da mãe,
# cartão PARTE 2 + botão Seguir e @ andando no rodapé.
import math, os, re, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from build import CENAS
R = os.path.dirname(os.path.abspath(__file__)); W, H, FPS = 720, 1280, 30
fnt = lambda s: ImageFont.truetype(f"{R}/../../duas_bombas/Caveat-Bold.ttf", s)
ini = list(np.cumsum([0] + [c[0] for c in CENAS])); TOT = ini[-1]
TXT = {1: "A GAROTA QUE CAIU DO CÉU\nhistória real · parte 2", 2: "25 de dezembro de 1971", 8: "Panguana · a estação dos pais", 9: "o que o pai ensinou", 14: "PARTE 3 no perfil"}
run = subprocess.check_call
import wave
def dur(f):
    w = wave.open(f); return w.getnframes() / w.getframerate()
def etiqueta(txt, size, fundo=(255, 253, 244, 245)):
    fo = fnt(size); lines = txt.split("\n"); dd = ImageDraw.Draw(Image.new("L", (1, 1)))
    tw = max(dd.textbbox((0, 0), l, font=fo)[2] for l in lines); lh = int(size * 1.08); pad = 22
    im = Image.new("RGBA", (tw + 2 * pad + 10, lh * len(lines) + 2 * pad + 14), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([8, 12, im.width - 1, im.height - 1], 24, fill=(0, 0, 0, 80))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(7))); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, im.width - 10, im.height - 14], 24, fill=fundo, outline=(40, 40, 40, 255), width=4)
    for j, l in enumerate(lines): d.text(((im.width - 10) // 2, pad + j * lh + lh // 2 - 2), l, font=fo if j == 0 else fnt(int(size * 0.75)), fill=(200, 45, 35, 255) if j == 0 and len(lines) > 1 else (35, 35, 35, 255), anchor="mm")
    return im
def legenda(txt):
    fo = fnt(50); dd = ImageDraw.Draw(Image.new("L", (1, 1))); palavras = txt.split(); lines = [""]
    for p in palavras:
        tst = (lines[-1] + " " + p).strip()
        if dd.textbbox((0, 0), tst, font=fo)[2] > 600 and lines[-1]: lines.append(p)
        else: lines[-1] = tst
    im = Image.new("RGBA", (W, 60 * len(lines) + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for j, l in enumerate(lines): d.text((W // 2, 34 + j * 60), l, font=fo, fill=(255, 255, 255, 255), anchor="mm", stroke_width=5, stroke_fill=(20, 20, 20, 255))
    return im
def cartao_mae():
    im = Image.new("RGBA", (600, 300), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([6, 10, 599, 299], 18, fill=(0, 0, 0, 90)); d.rounded_rectangle([0, 0, 590, 288], 18, fill=(251, 246, 234, 250), outline=(40, 40, 40, 255), width=4)
    d.text((295, 120), "“Agora acabou tudo.”", font=fnt(66), fill=(35, 35, 35, 255), anchor="mm")
    d.text((295, 220), "segundo o relato de Juliane", font=fnt(36), fill=(120, 110, 100, 255), anchor="mm")
    return im
def botao(seguindo):
    im = Image.new("RGBA", (330, 110), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, 320, 100], 22, fill=(58, 58, 64, 255) if seguindo else (0, 149, 246, 255))
    d.text((160, 48), "Seguindo" if seguindo else "Seguir", font=fnt(58), fill=(255, 255, 255, 255), anchor="mm")
    return im
# legendas: cada fala do narrador em pedaços (por pontuação), tempo proporcional ao tamanho
falas = [p.strip() for p in open(f"{R}/narrador.txt", encoding="utf-8").read().split("\n\n") if p.strip()]
SUB = []
for c, (D, fs) in enumerate(CENAS, 1):
    for nome, t in fs:
        k = int(nome[1:]) - 1; txt = falas[k]; d = dur(f"{R}/audio/{nome}.wav")
        pedacos = [x.strip() for x in re.split(r"(?<=[.?!])\s+|(?<=\.\.\.)\s+", txt) if x.strip()]
        tam = [len(x) for x in pedacos]; a = ini[c - 1] + t
        for x, n in zip(pedacos, tam): b = a + d * n / sum(tam); SUB.append((a, b + 0.05, legenda(x))); a = b
WM = etiqueta("@Cardeno_Amarelo", 30); LAB = {k: etiqueta(v, 46 if "\n" in v else 52) for k, v in TXT.items()}
B0, B1 = botao(False), botao(True)
# 1) vídeo
open(f"{R}/tmp_v.txt", "w").write("\n".join(f"file '{R}/flow/f{i:02d}.mp4'" for i in range(1, len(CENAS) + 1)))
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", f"{R}/tmp_v.txt", "-c", "copy", f"{R}/tmp_v.mp4"])
# 2) som: vozes nos tempos certos; trilha abaixa sob a voz (sidechain)
ins, flt = [], []
for c, (D, fs) in enumerate(CENAS, 1):
    for nome, t in fs:
        ins += ["-i", f"{R}/audio/{nome}.wav"]; ms = int((ini[c - 1] + t) * 1000); k = len(flt)
        flt.append(f"[{k}:a]aresample=44100,pan=stereo|c0=c0|c1=c0,adelay={ms}|{ms}[v{k}]")
n = len(flt)
fc = ";".join(flt) + ";" + "".join(f"[v{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0:duration=longest,apad,atrim=0:{TOT:.3f},asplit=2[voz][key];" + \
     f"[{n}:a]volume=0.9[s];[s][key]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[sd];[voz][sd]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95"
run(["ffmpeg", "-y", "-v", "error", *ins, "-i", f"{R}/audio/sfx.wav", "-filter_complex", fc, "-ac", "2", f"{R}/tmp_mix.wav"])
# 3) textos por cima
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{R}/tmp_v.mp4", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
out = f"{R}/tmp_final.mp4"
enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", f"{R}/tmp_mix.wav",
    "-c:v", "libx264", "-crf", "30", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-af", "loudnorm=I=-15:TP=-1.5", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
fr = 0
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    t = fr / FPS; im = Image.frombytes("RGB", (W, H), b).convert("RGBA")
    c = next((i for i in range(1, len(CENAS) + 1) if ini[i - 1] <= t < ini[i]), len(CENAS)); tc = t - ini[c - 1]
    if c in LAB and 0.15 <= tc < CENAS[c - 1][0] - (0 if c == len(CENAS) else 0.2):
        lab = LAB[c]; k = min(1, (tc - 0.15) / 0.25); s = 0.6 + 0.4 * k
        l2 = lab.resize((max(1, int(lab.width * s)), max(1, int(lab.height * s)))); im.alpha_composite(l2, ((W - l2.width) // 2, 105 - (l2.height - lab.height) // 2))
    for a, z, img in SUB:
        if a <= t < z: im.alpha_composite(img, (0, H - 330))
    if c == len(CENAS) and tc > 1.0:
        bt = B1 if tc > 3.6 else B0; s = min(1, (tc - 1.0) / 0.25) * (0.92 if 3.45 < tc < 3.6 else 1)
        b2 = bt.resize((max(1, int(bt.width * s)), max(1, int(bt.height * s)))); im.alpha_composite(b2, ((W - b2.width) // 2, 560))
    x = int((W - WM.width) / 2 + math.sin(t * 0.35) * 200); im.alpha_composite(WM, (x, H - 120))
    enc.stdin.write(im.convert("RGB").tobytes()); fr += 1
enc.stdin.close(); enc.wait()
os.replace(out, f"{R}/garota_ceu_parte2.mp4")
for p in os.listdir(R):
    if p.startswith("tmp_"): os.remove(f"{R}/{p}")
print("ok", fr / FPS)

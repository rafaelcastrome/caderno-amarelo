# Parte 1 (Flow realista): clipes do Flow + vozes (narrador Algieba, Juliane Laomedeia, mãe Kore) + legendas + etiquetas + Seguir.
# Clipes em ../flow_p1/video/cenaNN.mp4. Usa o COMEÇO de cada clipe (a foto aprovada é o 1º quadro); se o clipe for curto, fica mais lento.
import math, os, re, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
R = os.path.dirname(os.path.abspath(__file__)); V = f"{R}/../flow_p1/video"; A = f"{R}/audio"; W, H, FPS = 720, 1280, 30
fnt = lambda s: ImageFont.truetype(f"{R}/../../duas_bombas/Caveat-Bold.ttf", s)
# (duração, [(fala, início na cena)])
CENAS = [
 (5.0, [("N1", 0.4)]), (10.6, [("N2", 0.4)]), (7.9, [("J1", 0.5), ("M1", 3.0)]), (4.3, [("N3", 0.4)]), (5.3, [("N4", 0.4)]),
 (5.4, [("J2", 0.4), ("M2", 2.7)]), (3.0, [("N5", 0.4)]), (6.6, [("N6", 0.4), ("M3", 4.4)]), (3.2, [("N7", 0.4)]), (3.2, [("N8", 0.5)]),
 (6.2, [("N9", 0.3)]), (3.6, [("N10", 0.4)]), (2.6, []), (7.8, [("J3", 0.6), ("N11", 3.4)]), (9.5, [("N12", 0.5)]),
]
TEXTOS = {**{f"N{i+1}": t for i, t in enumerate(p.strip() for p in open(f"{R}/narrador.txt", encoding="utf-8").read().split("\n\n") if p.strip())},
          "J1": "Mãe, posso ficar com a janela?", "M1": "Pode, filha. É uma horinha só... teu pai já tá esperando a gente.",
          "J2": "Mãe... olha lá fora!", "M2": "Calma, filha. Segura a minha mão.", "M3": "“Agora acabou tudo.”", "J3": "Mãe?... Mãe!"}
COR = {"N": (255, 255, 255), "J": (255, 226, 120), "M": (255, 190, 175)}
LAB = {1: ("A GAROTA QUE CAIU DO CÉU\nhistória real · parte 1", 0.15, None), 2: ("Lima · Peru · 24/12/1971", 0.3, None),
       3: ("cena reconstruída", 0.3, "pequena"), 6: ("cena reconstruída", 0.3, "pequena"), 8: ("segundo o relato dela", 4.2, "pequena")}
ini = list(np.cumsum([0] + [c[0] for c in CENAS])); TOT = ini[-1]
run = subprocess.check_call
def dur(f):
    w = wave.open(f); return w.getnframes() / w.getframerate()
def vdur(f): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))
def etiqueta(txt, size, fundo=(255, 253, 244, 245)):
    fo = fnt(size); lines = txt.split("\n"); dd = ImageDraw.Draw(Image.new("L", (1, 1)))
    tw = max(dd.textbbox((0, 0), l, font=fo)[2] for l in lines); lh = int(size * 1.08); pad = 18 if size < 40 else 22
    im = Image.new("RGBA", (tw + 2 * pad + 10, lh * len(lines) + 2 * pad + 14), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([8, 12, im.width - 1, im.height - 1], 20, fill=(0, 0, 0, 80))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(7))); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, im.width - 10, im.height - 14], 20, fill=fundo, outline=(40, 40, 40, 255), width=3)
    for j, l in enumerate(lines): d.text(((im.width - 10) // 2, pad + j * lh + lh // 2 - 2), l, font=fo if j == 0 else fnt(int(size * 0.75)), fill=(200, 45, 35, 255) if j == 0 and len(lines) > 1 else (35, 35, 35, 255), anchor="mm")
    return im
def legenda(txt, cor):
    fo = fnt(50); dd = ImageDraw.Draw(Image.new("L", (1, 1))); lines = [""]
    for p in txt.split():
        tst = (lines[-1] + " " + p).strip()
        if dd.textbbox((0, 0), tst, font=fo)[2] > 600 and lines[-1]: lines.append(p)
        else: lines[-1] = tst
    im = Image.new("RGBA", (W, 60 * len(lines) + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for j, l in enumerate(lines): d.text((W // 2, 34 + j * 60), l, font=fo, fill=cor + (255,), anchor="mm", stroke_width=5, stroke_fill=(20, 20, 20, 255))
    return im
def botao(seguindo):
    im = Image.new("RGBA", (330, 110), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, 320, 100], 22, fill=(58, 58, 64, 255) if seguindo else (0, 149, 246, 255))
    d.text((160, 48), "Seguindo" if seguindo else "Seguir", font=fnt(58), fill=(255, 255, 255, 255), anchor="mm")
    return im
SUB = []
for c, (D, fs) in enumerate(CENAS, 1):
    for nome, t in fs:
        txt = TEXTOS[nome]; d = dur(f"{A}/{nome}.wav")
        pedacos = [x.strip() for x in re.split(r"(?<=[.?!])\s+", txt) if x.strip()]
        tam = [len(x) for x in pedacos]; a = ini[c - 1] + t
        for x, n in zip(pedacos, tam): b = a + d * n / sum(tam); SUB.append((a, b + 0.05, legenda(x, COR[nome[0]]))); a = b
WM = etiqueta("@Cardeno_Amarelo", 30); LABS = {k: etiqueta(v[0], 34 if v[2] else (46 if "\n" in v[0] else 52)) for k, v in LAB.items()}
FIM = etiqueta("A PARTE 2 já tá\nno meu perfil", 56); B0, B1 = botao(False), botao(True)
# 1) cada cena: começo do clipe, 720x1280, na duração certa; som do clipe guardado
partes = []
for i, (D, _) in enumerate(CENAS, 1):
    src = f"{V}/cena{i:02d}.mp4"; out = f"{R}/tmp_c{i:02d}.mp4"; vd = vdur(src); k = max(1.0, D / (vd - 0.1))
    run(["ffmpeg", "-y", "-v", "error", "-i", src, "-f", "lavfi", "-t", str(D), "-i", "anullsrc=r=44100:cl=stereo", "-filter_complex",
         f"[0:v]setpts={k:.4f}*PTS,scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},trim=0:{D},setpts=PTS-STARTPTS[v];"
         f"[0:a]atempo={1/k:.4f},aresample=44100,aformat=channel_layouts=stereo,atrim=0:{D},asetpts=PTS-STARTPTS[a0];[a0][1:a]amix=inputs=2:duration=longest:normalize=0,atrim=0:{D}[a]",
         "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18", "-c:a", "pcm_s16le", out.replace(".mp4", ".mkv")])
    partes.append(out.replace(".mp4", ".mkv"))
open(f"{R}/tmp_v.txt", "w").write("\n".join(f"file '{p}'" for p in partes))
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", f"{R}/tmp_v.txt", "-c:v", "copy", "-c:a", "pcm_s16le", f"{R}/tmp_v.mkv"])
# 2) som: vozes nos tempos; ambiente dos clipes a ~0.35 e abaixando sob a voz
ins, flt = [], []
for c, (D, fs) in enumerate(CENAS, 1):
    for nome, t in fs:
        ins += ["-i", f"{A}/{nome}.wav"]; ms = int((ini[c - 1] + t) * 1000); k = len(flt)
        flt.append(f"[{k}:a]aresample=44100,pan=stereo|c0=c0|c1=c0,adelay={ms}|{ms}[v{k}]")
n = len(flt)
fc = ";".join(flt) + ";" + "".join(f"[v{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0:duration=longest,apad,atrim=0:{TOT:.3f},asplit=2[voz][key];" + \
     f"[{n}:a]volume=0.35[s];[s][key]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=400[sd];[voz][sd]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95"
run(["ffmpeg", "-y", "-v", "error", *ins, "-i", f"{R}/tmp_v.mkv", "-filter_complex", fc, "-ac", "2", f"{R}/tmp_mix.wav"])
# 3) textos por cima
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{R}/tmp_v.mkv", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
out = f"{R}/tmp_final.mp4"
enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", f"{R}/tmp_mix.wav",
    "-c:v", "libx264", "-crf", "27", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-af", "loudnorm=I=-15:TP=-1.5", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
fr = 0
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    t = fr / FPS; im = Image.frombytes("RGB", (W, H), b).convert("RGBA")
    c = next((i for i in range(1, len(CENAS) + 1) if ini[i - 1] <= t < ini[i]), len(CENAS)); tc = t - ini[c - 1]
    if c in LABS and LAB[c][1] <= tc < CENAS[c - 1][0] - 0.2:
        lab = LABS[c]; k = min(1, (tc - LAB[c][1]) / 0.25); s = 0.6 + 0.4 * k
        l2 = lab.resize((max(1, int(lab.width * s)), max(1, int(lab.height * s)))); im.alpha_composite(l2, ((W - l2.width) // 2, 105 - (l2.height - lab.height) // 2))
    for a, z, img in SUB:
        if a <= t < z: im.alpha_composite(img, (0, H - 330))
    if c == len(CENAS) and tc > 5.0:
        k = min(1, (tc - 5.0) / 0.3); f2 = FIM.copy(); f2.putalpha(Image.eval(FIM.getchannel("A"), lambda a: int(a * k))); im.alpha_composite(f2, ((W - FIM.width) // 2, 420))
        bt = B1 if tc > 7.6 else B0; s = min(1, (tc - 5.6) / 0.25) * (0.92 if 7.45 < tc < 7.6 else 1)
        if tc > 5.6: b2 = bt.resize((max(1, int(bt.width * s)), max(1, int(bt.height * s)))); im.alpha_composite(b2, ((W - b2.width) // 2, 640))
    x = int((W - WM.width) / 2 + math.sin(t * 0.35) * 200); im.alpha_composite(WM, (x, H - 120))
    enc.stdin.write(im.convert("RGB").tobytes()); fr += 1
enc.stdin.close(); enc.wait()
os.replace(out, f"{R}/garota_ceu_parte1.mp4")
for p in os.listdir(R):
    if p.startswith("tmp_"): os.remove(f"{R}/{p}")
print("ok", fr / FPS)

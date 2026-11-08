# Parte 2 (Flow realista): clipes do Flow + vozes (narrador Algieba, Juliane Laomedeia, mãe Kore) + legendas + etiquetas + Seguir.
# Clipes em ../flow_p1/video/cenaNN.mp4. Usa o COMEÇO de cada clipe (a foto aprovada é o 1º quadro); se o clipe for curto, fica mais lento.
import math, os, re, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
R = os.path.dirname(os.path.abspath(__file__)); V = f"{R}/../flow_p2/video"; A = f"{R}/audio"; W, H, FPS = 720, 1280, 30
fnt = lambda s: ImageFont.truetype(f"{R}/../../duas_bombas/Caveat-Bold.ttf", s)
# (duração ou None = automática pela fala, [(fala, início na cena)], opções: ss = começo no clipe, amb = clipe de onde vem o som ambiente)
# Cenas com fala: clipe do Flow em velocidade real, cada pedaço da nossa voz começa onde a boca começa (medido no áudio do Flow).
CENAS = [
 (None, [("N1", 0.6)], {}), (None, [("N2", 0.4)], {}), (None, [("N3", 0.4)], {}), (None, [("N4", 0.4)], {}),
 (7.4, [("J1a", 0.82), ("J1b", 2.6), ("J1c", 4.7), ("N5", 6.15)], {"amb": "cena02"}), (None, [("N6", 0.4)], {}),
 (None, [("J2a", 0.45), ("J2b", 2.58), ("N7", 3.95)], {"amb": "cena02"}), (None, [("N8", 0.4)], {"amb": "cena06"}),
 (7.3, [("P1a", 0.17), ("P1b", 1.65), ("P1c", 3.03), ("P1d", 4.8)], {"amb": "cena02"}), (None, [("N9", 0.4)], {}),
 (3.8, [("J3a", 1.06), ("J3b", 1.89)], {"ss": 3.6, "amb": "cena02"}), (None, [("N10", 0.4)], {}),
 (4.0, [("J4a", 0.71), ("J4b", 2.39)], {"ss": 1.6, "amb": "cena02"}), (None, [("N11", 0.5)], {"fim": 3.4}),
]
TEXTOS = {**{f"N{i+1}": t for i, t in enumerate(p.strip() for p in open(f"{R}/narrador.txt", encoding="utf-8").read().split("\n\n") if p.strip())},
          "J1a": "Mãe?...", "J1b": "Mãe!", "J1c": "Cadê você?", "J2a": "Eu tô aqui!", "J2b": "Aqui embaixo!",
          "P1a": "Se um dia tu te perder aqui,", "P1b": "procura água.", "P1c": "Riacho vira rio...", "P1d": "e onde tem rio, tem gente.",
          "J3a": "Água...", "J3b": "tô ouvindo água.", "J4a": "Segue a água, Juliane...", "J4b": "segue a água."}
COR = {"N": (255, 255, 255), "J": (255, 226, 120), "P": (170, 215, 255)}
def dur(f):
    w = wave.open(f); return w.getnframes() / w.getframerate()
A = f"{R}/audio"
CENAS = [((D if D else max(2.6, max(t + dur(f"{A}/{n}.wav") for n, t in fs) + 0.45 + o.get("fim", 0))), fs, o) for D, fs, o in CENAS]
LAB = {2: ("25/12/1971 · Amazônia peruana", 0.3, None), 5: ("cena reconstruída", 0.3, "pequena"), 7: ("cena reconstruída", 0.3, "pequena"),
       8: ("lembrança · a estação na floresta", 0.3, "pequena"), 9: ("cena reconstruída", 0.3, "pequena"), 11: ("cena reconstruída", 0.2, "pequena"),
       13: ("cena reconstruída", 0.2, "pequena")}
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
for c, (D, fs, _) in enumerate(CENAS, 1):
    for nome, t in fs:
        txt = TEXTOS.get(nome, TEXTOS.get(nome[:2])); d = dur(f"{A}/{nome}.wav")
        pedacos = [x.strip() for x in re.split(r"(?<=[.?!])\s+", txt) if x.strip()]
        tam = [len(x) for x in pedacos]; a = ini[c - 1] + t
        for x, n in zip(pedacos, tam): b = a + d * n / sum(tam); SUB.append((a, b + 0.05, legenda(x, COR[nome[0]]))); a = b
SUB.sort(key=lambda x: x[0]); SUB = [(a, min(z, SUB[i + 1][0]) if i + 1 < len(SUB) else z, im) for i, (a, z, im) in enumerate(SUB)]  # uma legenda por vez
WM = etiqueta("@Cardeno_Amarelo", 30); LABS = {k: etiqueta(v[0], 34 if v[2] else (46 if "\n" in v[0] else 52)) for k, v in LAB.items()}
B0, B1 = botao(False), botao(True)
# folha amarela pautada do Caderno Amarelo (abre e fecha o episódio)
def pagina(linhas):
    im = Image.new("RGBA", (W, H), (244, 221, 136, 255)); d = ImageDraw.Draw(im); r = np.random.default_rng(5)
    for _ in range(9000): x, y = r.integers(0, W), r.integers(0, H); d.point((int(x), int(y)), fill=(120, 100, 40, int(r.integers(5, 22))))
    for y in range(150, H, 46): d.line([(0, y), (W, y)], fill=(105, 150, 195, 150), width=2)
    for x in (84, 90): d.line([(x, 0), (x, H)], fill=(205, 85, 85, 190), width=2)
    for txt, y, tam, cor in linhas: d.text((W // 2 + 20, y), txt, font=fnt(tam), fill=cor, anchor="mm")
    sh = Image.new("RGBA", (W, 40), (0, 0, 0, 0)); ImageDraw.Draw(sh).rectangle([0, 0, W, 40], fill=(0, 0, 0, 0))
    return im
TINTA, VERM = (40, 38, 60, 255), (200, 45, 35, 255)
ABRE = pagina([("A GAROTA QUE", 470, 96, TINTA), ("CAIU DO CÉU", 575, 96, TINTA), ("história real · parte 2", 690, 50, VERM)])
FECHA = pagina([("Segue pra ver", 430, 80, TINTA), ("A PARTE 3", 540, 100, VERM)])
SOMBRA = Image.new("RGBA", (W, 60), (0, 0, 0, 0))
for i in range(60): ImageDraw.Draw(SOMBRA).line([(0, i), (W, i)], fill=(0, 0, 0, int(90 * (1 - i / 60))))
ease = lambda k: (lambda k: k * k * (3 - 2 * k))(min(1, max(0, k)))
# 1) cada cena: começo do clipe, 720x1280, na duração certa; som do clipe guardado
FALA = {5, 7, 9, 11, 13}
partes = []
for i, (D, _, o) in enumerate(CENAS, 1):
    src = f"{V}/cena{i:02d}.mp4"; amb = f"{V}/{o.get('amb', f'cena{i:02d}')}.mp4"; ss = o.get("ss", 0); out = f"{R}/tmp_c{i:02d}.mkv"
    k = 1.0 if i in FALA else max(1.0, D / (vdur(src) - ss - 0.1))  # cenas sem fala podem ficar um pouco mais lentas; com fala, velocidade real
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(ss), "-i", src, "-i", amb, "-f", "lavfi", "-t", str(D), "-i", "anullsrc=r=44100:cl=stereo", "-filter_complex",
         f"[0:v]setpts={k:.4f}*PTS,scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},tpad=stop_mode=clone:stop_duration=6,trim=0:{D},setpts=PTS-STARTPTS[v];"
         f"[1:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:{D},asetpts=PTS-STARTPTS[a0];[a0][2:a]amix=inputs=2:duration=longest:normalize=0,atrim=0:{D}[a]",
         "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18", "-c:a", "pcm_s16le", out])
    partes.append(out)
open(f"{R}/tmp_v.txt", "w").write("\n".join(f"file '{p}'" for p in partes))
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", f"{R}/tmp_v.txt", "-c:v", "copy", "-c:a", "pcm_s16le", f"{R}/tmp_v.mkv"])
# 2) som: vozes nos tempos; ambiente dos clipes a ~0.35 e abaixando sob a voz
ins, flt = [], []
for c, (D, fs, _) in enumerate(CENAS, 1):
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
    "-c:v", "libx264", "-crf", "32", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-af", "loudnorm=I=-15:TP=-1.5", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
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
    if t < 1.2: # abre: a folha sobe e revela o filme
        y = int(-H * ease((t - 0.55) / 0.6)); im.alpha_composite(ABRE, (0, y)); im.alpha_composite(SOMBRA, (0, min(H - 1, y + H)))
    F0 = CENAS[-1][0] - 3.6  # fecha: a folha volta de baixo com o convite e o Seguir
    if c == len(CENAS) and tc > F0:
        u = tc - F0; y = int(H * (1 - ease(u / 0.5))); im.alpha_composite(SOMBRA, (0, max(0, y - 60))) if y > 60 else None; im.alpha_composite(FECHA, (0, y))
        bt = B1 if u > 2.6 else B0; s = min(1, max(0, (u - 0.8) / 0.25)) * (0.92 if 2.45 < u < 2.6 else 1)
        if u > 0.8: b2 = bt.resize((max(1, int(bt.width * s)), max(1, int(bt.height * s)))); im.alpha_composite(b2, ((W - b2.width) // 2, y + 640))
    x = int((W - WM.width) / 2 + math.sin(t * 0.35) * 200); im.alpha_composite(WM, (x, H - 120))
    enc.stdin.write(im.convert("RGB").tobytes()); fr += 1
enc.stdin.close(); enc.wait()
os.replace(out, f"{R}/garota_ceu_parte2.mp4")
for p in os.listdir(R):
    if p.startswith("tmp_"): os.remove(f"{R}/{p}")
print("ok", fr / FPS)

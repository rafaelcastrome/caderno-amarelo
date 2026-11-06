# Monta um episódio: clipes 3D (ep N/flow/cenaNN.mp4 + .wav de papel) + voz + textos por cima + @ andando.
# uso: python3 montar.py N
import json, math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
R = os.path.dirname(os.path.abspath(__file__)); E = int(sys.argv[1]); D = f"{R}/ep{E}"
W, H, FPS = 720, 1280, 30
f = lambda s: ImageFont.truetype(f"{R}/Caveat-Bold.ttf", s)
TXT = {
 1: {1: "O HOMEM DAS DUAS BOMBAS\nPARTE 1", 2: "Japão, 1945", 3: "Hiroshima", 4: "6 de agosto", 15: "PARTE 2 no perfil"},
 2: {1: "O HOMEM DAS DUAS BOMBAS\nPARTE 2", 3: "9 de agosto", 7: "11 da manhã", 12: "PARTE 3 no perfil"},
 3: {1: "O HOMEM DAS DUAS BOMBAS\nPARTE 3", 4: "15 de agosto de 1945", 7: "reconhecido nas DUAS"},
}[E]
tl = json.load(open(f"{D}/timeline.json"))["cenas"]; TOTAL = tl[-1]["end"]
run = lambda c: subprocess.check_call(c)

def etiqueta(txt, size):
    fo = f(size); lines = txt.split("\n"); dd = ImageDraw.Draw(Image.new("L", (1, 1)))
    tw = max(dd.textbbox((0, 0), l, font=fo)[2] for l in lines); lh = int(size * 1.08); pad = 26
    im = Image.new("RGBA", (tw + 2 * pad + 10, lh * len(lines) + 2 * pad + 14), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([8, 12, im.width - 1, im.height - 1], 24, fill=(0, 0, 0, 80))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(7))); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, im.width - 10, im.height - 14], 24, fill=(255, 253, 244, 245), outline=(40, 40, 40, 255), width=4)
    for j, l in enumerate(lines): d.text(((im.width - 10) // 2, pad + j * lh + lh // 2 - 2), l, font=fo, fill=(200, 45, 35, 255) if j == 0 and len(lines) > 1 else (35, 35, 35, 255), anchor="mm")
    return im
WM = etiqueta("@Cardeno_Amarelo", 30)
LAB = {k: etiqueta(v, 50 if "\n" in v else 58) for k, v in TXT.items()}

# 1) vídeo e som de papel em sequência
lv, la = [], []
for i, c in enumerate(tl, 1):
    lv.append(f"file '{D}/flow/cena{i:02d}.mp4'")
    wav = f"{D}/flow/cena{i:02d}.wav"; dur = c["end"] - c["start"]; out = f"{D}/tmp_s{i}.wav"
    src = ["-i", wav] if os.path.exists(wav) else ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]
    run(["ffmpeg", "-y", "-v", "error", *src, "-af", f"aresample=44100,apad,atrim=0:{dur:.3f}", "-ac", "2", out]); la.append(f"file '{out}'")
open(f"{D}/tmp_v.txt", "w").write("\n".join(lv)); open(f"{D}/tmp_a.txt", "w").write("\n".join(la))
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", f"{D}/tmp_v.txt", "-c", "copy", f"{D}/tmp_v.mp4"])
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", f"{D}/tmp_a.txt", f"{D}/tmp_sfx.wav"])
run(["ffmpeg", "-y", "-v", "error", "-i", f"{D}/narration.mp3", "-i", f"{D}/tmp_sfx.wav", "-filter_complex",
     "[0:a]aresample=44100,volume=1.0[v];[1:a]volume=0.35[s];[v][s]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95", "-ac", "2", f"{D}/tmp_mix.wav"])

# 2) textos por cima, quadro a quadro
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{D}/tmp_v.mp4", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
out = f"{D}/duas_bombas_parte{E}.mp4"
enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-i", f"{D}/tmp_mix.wav", "-c:v", "libx264", "-crf", "24", "-preset", "medium", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
n = 0
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    t = n / FPS; im = Image.frombytes("RGB", (W, H), b).convert("RGBA")
    cena = next((i for i, c in enumerate(tl, 1) if c["start"] <= t < c["end"]), len(tl))
    if cena in LAB:
        lab = LAB[cena]; k = min(1, (t - tl[cena - 1]["start"]) / 0.25); s = 0.6 + 0.4 * k if k < 1 else 1
        l2 = lab.resize((max(1, int(lab.width * s)), max(1, int(lab.height * s))))
        im.alpha_composite(l2, ((W - l2.width) // 2, 105 - (l2.height - lab.height) // 2))
    x = int((W - WM.width) / 2 + math.sin(t * 0.35) * 200); im.alpha_composite(WM, (x, H - 120))
    enc.stdin.write(im.convert("RGB").tobytes()); n += 1
enc.stdin.close(); enc.wait()
for p in os.listdir(D):
    if p.startswith("tmp_"): os.remove(f"{D}/{p}")
print(out, n / FPS)

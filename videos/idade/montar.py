# Monta "Eu adivinho a tua idade" (formato papel recortado: clipes do Google Flow + voz + textos por cima).
# Uso: python3 montar.py            -> eu_adivinho_idade.mp4
# Entrada: audio/cenaN.wav (voz Algieba, Gemini gemini-3.1-flash-tts-preview, uma requisição só: falas/tts_tudo.py) e flow/cenaNN.mp4 (clipes do Flow).
# A última cena reaproveita o clipe da cena 1 (loop). O fato de 2027 saiu pra caber em ~40 s (sobra em falas/). Cena sem clipe vira um quadro provisório no caderno amarelo.
import json, os, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

R = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 720, 1280, 30
TEMPO = 1.12  # acelera a voz pra caber em ~40 s
SOM_CLIPES = 0.35  # volume do som original dos clipes do Flow, por baixo da voz
FONT = os.path.join(R, "Caveat-Bold.ttf")
f = lambda s: ImageFont.truetype(FONT, s)

# (texto na tela, pausa depois da fala, contagem 3-2-1 na pausa, quando o texto entra: fração da fala)
CENAS = [
    dict(txt="EU ADIVINHO\nA TUA IDADE", pausa=0.3, entra=0.0, desc="calculadora com chocolate"),
    dict(txt="chocolate por\nsemana: 1 a 9", pausa=0.8, entra=0.0, desc="barra de chocolate"),
    dict(txt="× 2", pausa=1.4, conta=True, desc="duas barras"),
    dict(txt="+ 5", pausa=1.4, conta=True, desc="mão com 5 dedos"),
    dict(txt="× 50", pausa=1.4, conta=True, desc="pilha de moedas"),
    dict(txt="já fez: + 1776\nnão fez: + 1775", pausa=1.8, conta=True, entra=0.1, desc="calendário e bolinho"),
    dict(txt="− o ano em\nque nasceu", pausa=1.6, conta=True, desc="berço com ursinho"),
    dict(txt="1º = chocolate\n2 últimos = IDADE", pausa=0.5, entra=0.3, desc="bolo de aniversário"),
    dict(txt="MANDA PRA\nUM AMIGO", pausa=0.6, entra=0.0, clipe=1, desc="calculadora de novo (loop)"),
]
FLOW = os.path.join(R, "flow")  # clipes do Flow (fora do git)

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))

def run(cmd):
    subprocess.check_call(cmd)

# ---------- áudio ----------
tmp = os.path.join(R, "tmp"); os.makedirs(tmp, exist_ok=True)
lista, t = [], 0.0
for i, c in enumerate(CENAS, 1):
    wav = os.path.join(tmp, f"c{i}.wav")
    src = os.path.join(R, "audio", f"cena{i}.wav")  # Algieba (Gemini 3.1), cortado de falas/Algieba_tudo.wav
    if c.get("corte"):  # abre um respiro no meio da fala
        src2 = os.path.join(tmp, f"c{i}_meio.wav"); k = c["corte"]; pm = c["pausa_meio"]
        run(["ffmpeg", "-y", "-v", "error", "-i", src, "-filter_complex",
             f"[0:a]atrim=0:{k},afade=t=out:st={k-0.02}:d=0.02,apad=pad_dur={pm}[a];[0:a]atrim={k},asetpts=PTS-STARTPTS,afade=t=in:d=0.02[b];[a][b]concat=n=2:v=0:a=1", src2])
        src = src2
    run(["ffmpeg", "-y", "-v", "error", "-i", src, "-ar", "44100", "-ac", "2", "-af",
         "silenceremove=stop_periods=-1:stop_duration=0.35:stop_threshold=-45dB,silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
         f"atempo={TEMPO},afade=t=in:d=0.01,areverse,afade=t=in:d=0.01,areverse,apad=pad_dur={c['pausa']}", wav])
    d = dur(wav); c["start"], c["fala"], c["end"] = t, d - c["pausa"], t + d; t += d
    lista.append(f"file '{wav}'")
open(os.path.join(tmp, "lista.txt"), "w").write("\n".join(lista) + "\n")
narr = os.path.join(R, "narration.wav")
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", os.path.join(tmp, "lista.txt"),
     "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "44100", narr])
TOTAL = t
json.dump({"total": round(TOTAL, 3), "cenas": [{k: (round(v, 3) if isinstance(v, float) else v) for k, v in c.items()} for c in CENAS]},
          open(os.path.join(R, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# ---------- fundo de cada cena ----------
def papel(i, desc):
    im = Image.new("RGB", (W, H), (247, 233, 160))
    d = ImageDraw.Draw(im)
    for y in range(140, H, 38): d.line([(0, y), (W, y)], fill=(160, 190, 215), width=2)
    d.line([(90, 0), (90, H)], fill=(220, 120, 120), width=3)
    d.text((W // 2, H // 2 + 120), f"cena {i}\n({desc})\n[clipe do Flow entra aqui]", font=f(44), fill=(140, 130, 100), anchor="mm", align="center")
    return im

def frames_fundo(i, c, n):
    """gera n quadros RGB (bytes) da cena i"""
    clip = os.path.join(FLOW, f"cena{c.get('clipe', i):02d}.mp4")
    if not os.path.exists(clip):
        b = papel(i, c["desc"]).tobytes()
        for _ in range(n): yield b
        return
    cd = dur(clip); need = n / FPS
    vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"
    ss = 0.0
    if cd < need: vf = f"setpts={need / cd:.4f}*PTS," + vf  # clipe curto: deixa mais lento
    else:  # clipe longo: acelera até 2x e pega o FINAL (onde o papel já está montado)
        sp = min(2.0, cd / need); ss = max(0.0, cd - need * sp - 0.05)
        vf = f"setpts=PTS/{sp:.4f}," + vf
    vf += f",fps={FPS}"
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{ss:.3f}", "-i", clip, "-an", "-vf", vf, "-frames:v", str(n), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    last = None; k = 0
    while k < n:
        b = p.stdout.read(W * H * 3)
        if len(b) < W * H * 3: break
        last = b; k += 1; yield b
    p.wait()
    for _ in range(n - k): yield last or papel(i, c["desc"]).tobytes()

# ---------- textos por cima ----------
def etiqueta(txt, size):
    fo = f(size); lines = txt.split("\n")
    tmpd = ImageDraw.Draw(Image.new("L", (1, 1)))
    ws = [tmpd.textbbox((0, 0), l, font=fo) for l in lines]
    tw = max(b[2] - b[0] for b in ws); lh = int(size * 1.05); th = lh * len(lines)
    pad = 34; im = Image.new("RGBA", (tw + 2 * pad, th + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([8, 12, im.width - 1, im.height - 1], 26, fill=(0, 0, 0, 90))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(8)))
    d = ImageDraw.Draw(im); d.rounded_rectangle([0, 0, im.width - 10, im.height - 14], 26, fill=(255, 253, 244, 245), outline=(40, 40, 40, 255), width=4)
    for j, l in enumerate(lines):
        d.text(((im.width - 10) // 2, pad + j * lh + lh // 2 - 4), l, font=fo, fill=(35, 35, 35, 255), anchor="mm")
    return im

def tabela():
    im = Image.new("RGBA", (620, 520), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, 610, 506], 26, fill=(255, 253, 244, 245), outline=(40, 40, 40, 255), width=4)
    fo = f(54)
    for k in range(20):
        col, row = k % 4, k // 4
        d.text((80 + col * 150, 60 + row * 96), f"{k + 1}={chr(65 + k)}", font=fo, fill=(35, 35, 35, 255), anchor="mm")
    return im

def contagem(n):
    im = Image.new("RGBA", (170, 170), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse([5, 5, 165, 165], fill=(230, 60, 50, 235), outline=(255, 255, 255, 255), width=6)
    d.text((85, 80), str(n), font=f(110), fill="white", anchor="mm"); return im

WM = etiqueta("@Cardeno_Amarelo", 34).resize((260, 76))
CONT = {n: contagem(n) for n in (1, 2, 3)}
for c in CENAS:
    c["img"] = tabela() if c.get("tabela") else etiqueta(c["txt"], 80 if c.get("grande") else (58 if len(c["txt"]) < 14 else 50))

def pop(t0, t):  # escala de entrada com um pulinho
    if t0 <= 0: return 1
    x = (t - t0) / 0.25
    if x <= 0: return 0
    if x >= 1: return 1
    return 1.12 * math.sin(x * math.pi / 2) if x < 0.8 else 1.12 - 0.6 * (x - 0.8)

# ---------- som original dos clipes (mesmo corte/velocidade do vídeo) ----------
def som_cena(i, c):
    clip = os.path.join(FLOW, f"cena{c.get('clipe', i):02d}.mp4"); n = round(c["end"] * FPS) - round(c["start"] * FPS); need = n / FPS
    out = os.path.join(tmp, f"s{i}.wav")
    if not os.path.exists(clip):
        run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=stereo", "-t", f"{need:.3f}", out]); return out
    cd = dur(clip); ss = 0.0
    if cd < need: sp = cd / need
    else: sp = min(2.0, cd / need); ss = max(0.0, cd - need * sp - 0.05)
    run(["ffmpeg", "-y", "-v", "error", "-ss", f"{ss:.3f}", "-i", clip, "-vn", "-af",
         f"atempo={sp:.4f},aresample=44100,apad,atrim=0:{need:.3f},afade=t=in:d=0.08,areverse,afade=t=in:d=0.08,areverse", "-ac", "2", out])
    return out
sl = [f"file '{som_cena(i, c)}'" for i, c in enumerate(CENAS, 1)]
open(os.path.join(tmp, "som.txt"), "w").write("\n".join(sl) + "\n")
som = os.path.join(tmp, "som.wav"); mix = os.path.join(tmp, "mix.wav")
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", os.path.join(tmp, "som.txt"), som])
run(["ffmpeg", "-y", "-v", "error", "-i", narr, "-i", som, "-filter_complex",
     f"[1:a]volume={SOM_CLIPES}[s];[0:a][s]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.9", mix])
narr = mix

# ---------- render ----------
out = os.path.join(R, "eu_adivinho_idade.mp4")
enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-i", narr, "-c:v", "libx264", "-preset", "medium", "-crf", "25", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
                        "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
g = 0
for i, c in enumerate(CENAS, 1):
    n = round(c["end"] * FPS) - round(c["start"] * FPS)
    t_in = c["start"] + c.get("entra", 0.15) * c["fala"]
    for k, b in enumerate(frames_fundo(i, c, n)):
        tt = (g + k) / FPS
        fr = Image.frombytes("RGB", (W, H), b).convert("RGBA")
        s = pop(t_in, tt)
        if s > 0:
            im = c["img"]; im2 = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))))
            y = 105 if not c.get("tabela") else H - 420
            fr.alpha_composite(im2, (W // 2 - im2.width // 2, max(12, y - im2.height // 2)))
        if c.get("conta") and tt >= c["start"] + c["fala"]:
            left = c["end"] - tt; num = min(3, max(1, math.ceil(left / (c["pausa"] / 3))))
            fr.alpha_composite(CONT[num], (W // 2 - 85, H - 340))
        # @ andando pelo rodapé
        x = int((W - WM.width) / 2 + (W - WM.width - 40) / 2 * math.sin(tt * 0.35))
        fr.alpha_composite(WM, (x, H - 150))
        enc.stdin.write(fr.convert("RGB").tobytes())
    g += n
enc.stdin.close(); enc.wait()
for p in os.listdir(tmp): os.remove(os.path.join(tmp, p))
os.rmdir(tmp)
print("ok", out, round(TOTAL, 1), "s", round(os.path.getsize(out) / 1e6, 1), "MB")

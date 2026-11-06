# Capas 1080x1920 dos 3 episódios: quadro forte do episódio + título grande.
import os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
R = os.path.dirname(os.path.abspath(__file__))
f = lambda s: ImageFont.truetype(f"{R}/Caveat-Bold.ttf", s)
CAPAS = {1: ("ep1/flow/cena01.mp4", 0.95), 2: ("ep2/flow/cena08.mp4", 0.35), 3: ("ep3/flow/cena09.mp4", 0.95)}
for e, (clip, frac) in CAPAS.items():
    p = f"{R}/{clip}"; d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))
    png = f"{R}/ep{e}/capa_tmp.png"
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-ss", f"{d * frac:.2f}", "-i", p, "-frames:v", "1", "-vf", "scale=1080:1920", png])
    im = Image.open(png).convert("RGBA"); W, H = im.size
    box = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(box)
    dd.rounded_rectangle([70, 150, W - 70, 640], 40, fill=(255, 253, 244, 240), outline=(40, 40, 40, 255), width=7)
    dd.text((W // 2, 300), "O HOMEM DAS", font=f(120), fill=(35, 35, 35), anchor="mm")
    dd.text((W // 2, 440), "DUAS BOMBAS", font=f(150), fill=(200, 45, 35), anchor="mm")
    dd.text((W // 2, 570), f"PARTE {e}", font=f(100), fill=(35, 35, 35), anchor="mm")
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([82, 168, W - 58, 660], 40, fill=(0, 0, 0, 90))
    im = Image.alpha_composite(Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(12))), box)
    im.convert("RGB").save(f"{R}/ep{e}/capa_parte{e}.jpg", quality=92); os.remove(png)
    print(f"ep{e}/capa_parte{e}.jpg")

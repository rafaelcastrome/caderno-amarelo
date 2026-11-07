# Capa da minissérie (vertical 1080x1920 e quadrada 1080x1080): foto do Flow da cena 01 + cartão no estilo do Caderno Amarelo.
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
R = os.path.dirname(os.path.abspath(__file__))
f = lambda s: ImageFont.truetype(f"{R}/../duas_bombas/Caveat-Bold.ttf", s)
foto = Image.open(f"{R}/flow_p1/img/cena01.png").convert("RGBA")
def capa(W, H, y0, esc, cy=0.55):
    im = ImageOps.fit(foto, (W, H), centering=(0.5, cy))
    x0, x1 = 70, W - 70; h = int(470 * esc)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([x0 + 12, y0 + 18, x1 + 12, y0 + h + 18], 40, fill=(0, 0, 0, 110))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(12)))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([x0, y0, x1, y0 + h], 40, fill=(255, 253, 244, 242), outline=(40, 40, 40, 255), width=7)
    d.text((W // 2, y0 + int(80 * esc)), "SÉRIE · HISTÓRIA REAL", font=f(int(66 * esc)), fill=(110, 105, 95), anchor="mm")
    d.text((W // 2, y0 + int(200 * esc)), "A GAROTA QUE", font=f(int(130 * esc)), fill=(35, 35, 35), anchor="mm")
    d.text((W // 2, y0 + int(345 * esc)), "CAIU DO CÉU", font=f(int(160 * esc)), fill=(200, 45, 35), anchor="mm")
    return im.convert("RGB")
capa(1080, 1920, 150, 1.0).save(f"{R}/capa_serie_vertical.jpg", quality=92)
capa(1080, 1080, 1080 - 50 - int(470 * 0.72), 0.72, cy=0.38).save(f"{R}/capa_serie_quadrada.jpg", quality=92)
print("ok")

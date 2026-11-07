# Capa da minissérie: a garota caindo nas poltronas (cena 01 da parte 1, Flow) + título + faixa "MINISSÉRIE · 4 PARTES".
# Texto dentro da faixa central 4:5 (y 285-1635) pra não cortar na grade do Instagram.
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
R = os.path.dirname(os.path.abspath(__file__)); fnt = lambda s: ImageFont.truetype(f"{R}/../duas_bombas/Caveat-Bold.ttf", s)
W, H = 1080, 1920; AMARELO, TINTA = (242, 194, 48, 255), (30, 30, 30, 255)
im = Image.open(f"{R}/flow_p1/img/cena01.png").convert("RGB"); s = W / im.width
im = im.resize((W, round(im.height * s)), Image.LANCZOS); y0 = (im.height - H) // 2; im = im.crop((0, y0, W, y0 + H)).convert("RGBA")
sombra = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sombra)
for y in range(H):  # escurece em cima e embaixo pro texto ler bem
    a = max(0, 150 - y * 150 // 620) if y < 620 else max(0, (y - 1380) * 170 // 540)
    ds.line([(0, y), (W, y)], fill=(0, 0, 0, a))
im = Image.alpha_composite(im, sombra); d = ImageDraw.Draw(im)
contorno = dict(stroke_width=10, stroke_fill=(20, 20, 20, 255))
d.text((W // 2, 340), "história real · 1971", font=fnt(66), fill=AMARELO, anchor="mm", stroke_width=6, stroke_fill=(20, 20, 20, 255))
for j, l in enumerate(["A GAROTA QUE", "CAIU DO CÉU"]):
    d.text((W // 2, 470 + j * 150), l, font=fnt(152), fill=(255, 255, 255, 255), anchor="mm", **contorno)
# faixa amarela como pedaço de folha do caderno
fx = Image.new("RGBA", (780, 120), (0, 0, 0, 0)); df = ImageDraw.Draw(fx)
df.rounded_rectangle([0, 0, 779, 119], 22, fill=AMARELO, outline=TINTA, width=6)
df.text((390, 58), "MINISSÉRIE · 4 PARTES", font=fnt(66), fill=TINTA, anchor="mm")
fx = fx.rotate(-3, expand=True, resample=Image.BICUBIC)
sh = Image.new("RGBA", fx.size, (0, 0, 0, 0)); sh.paste((0, 0, 0, 110), mask=fx.split()[3]); sh = sh.filter(ImageFilter.GaussianBlur(8))
px, py = (W - fx.width) // 2, 1440; im.alpha_composite(sh, (px + 8, py + 12)); im.alpha_composite(fx, (px, py))
d.text((W // 2, 1640), "Ela caiu de 3 mil metros... e sobreviveu.", font=fnt(54), fill=(255, 255, 255, 255), anchor="mm", stroke_width=5, stroke_fill=(20, 20, 20, 255))
d.text((W // 2, H - 110), "Caderno Amarelo", font=fnt(58), fill=AMARELO, anchor="mm", stroke_width=5, stroke_fill=(20, 20, 20, 255))
im.convert("RGB").save(f"{R}/capa_minisserie.jpg", quality=92); print("capa ok", im.size)

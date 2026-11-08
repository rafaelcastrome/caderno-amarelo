# Capa da parte 2 (720x1280): foto da cena 05 + cartão amarelo + "parte 2", no mesmo jeito da parte 1.
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
R = os.path.dirname(os.path.abspath(__file__)); W, H = 720, 1280
f = lambda s: ImageFont.truetype(f"{R}/../../duas_bombas/Caveat-Bold.ttf", s)
im = ImageOps.fit(Image.open(f"{R}/../flow_p2/img/cena05.png").convert("RGBA"), (W, H), centering=(0.5, 0.5))
sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([70, 102, 670, 338], 22, fill=(0, 0, 0, 110))
im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(10))); d = ImageDraw.Draw(im)
d.rounded_rectangle([62, 92, 658, 328], 22, fill=(244, 221, 136, 248), outline=(40, 38, 60, 255), width=3)
d.text((W // 2, 175), "Sozinha no meio", font=f(66), fill=(40, 38, 60), anchor="mm")
d.text((W // 2, 258), "da Amazônia", font=f(66), fill=(200, 45, 35), anchor="mm")
d.text((W // 2, 1185), "parte 2", font=f(70), fill=(255, 255, 255), anchor="mm", stroke_width=4, stroke_fill=(20, 20, 20))
im.convert("RGB").save(f"{R}/capa_parte2.jpg", quality=92); print("ok")

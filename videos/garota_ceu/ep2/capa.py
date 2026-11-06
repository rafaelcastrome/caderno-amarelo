# Capa da parte 2: ela sentada sozinha na floresta + "ELA ACORDOU SOZINHA NA AMAZÔNIA" + faixa "PARTE 2"
import subprocess, sys
from PIL import Image, ImageDraw, ImageFont
R = "."; fnt = lambda s: ImageFont.truetype("../../duas_bombas/Caveat-Bold.ttf", s)
subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-ss", "5.6", "-i", "flow/f01.mp4", "-frames:v", "1", "tmp_capa.png"])
im = Image.open("tmp_capa.png").convert("RGBA"); W, H = im.size; d = ImageDraw.Draw(im)
for j, l in enumerate(["ELA ACORDOU", "SOZINHA NA", "AMAZÔNIA"]):
    d.text((W // 2, 190 + j * 120), l, font=fnt(118), fill=(255, 255, 255, 255), anchor="mm", stroke_width=9, stroke_fill=(20, 20, 20, 255))
d.text((W // 2, 540), "com 17 anos e uma sandália só", font=fnt(64), fill=(242, 194, 48, 255), anchor="mm", stroke_width=6, stroke_fill=(20, 20, 20, 255))
d.rounded_rectangle([W // 2 - 150, H - 300, W // 2 + 150, H - 200], 20, fill=(242, 194, 48, 255), outline=(30, 30, 30, 255), width=5)
d.text((W // 2, H - 252), "PARTE 2", font=fnt(72), fill=(30, 30, 30, 255), anchor="mm")
d.text((W // 2, H - 150), "A garota que caiu do céu · história real", font=fnt(40), fill=(255, 255, 255, 255), anchor="mm", stroke_width=4, stroke_fill=(20, 20, 20, 255))
im.convert("RGB").save("capa_parte2.jpg", quality=92)
import os; os.remove("tmp_capa.png"); print("capa ok")

from PIL import Image, ImageDraw, ImageFont
import random
S=2; W,H=1080*S,1920*S
im=Image.new('RGB',(W,H),(251,245,223)); d=ImageDraw.Draw(im)
for x in range(0,W,54*S): d.line((x,0,x,H),fill=(205,220,240) if x%(216*S) else (170,195,230),width=S*(1 if x%(216*S) else 2))
for y in range(0,H,54*S): d.line((0,y,W,y),fill=(205,220,240) if y%(216*S) else (170,195,230),width=S*(1 if y%(216*S) else 2))
F='Caveat-Bold.ttf'
ft=ImageFont.truetype(F,148*S); fs=ImageFont.truetype(F,92*S); fn=ImageFont.truetype(F,96*S)
d.text((W/2,400*S),'ACHA DO 1 AO 25',font=ft,fill=(214,40,40),anchor='mm',stroke_width=1*S,stroke_fill=(214,40,40))
d.text((W/2,560*S),'agora tu joga de verdade!',font=fs,fill=(29,78,216),anchor='mm')
CORES=[('#fde2e4','#d62828'),('#dbeafe','#1d4ed8'),('#dcfce7','#15803d'),('#fef3c7','#d97706'),('#ede9fe','#7c3aed'),('#ffedd5','#ea580c'),('#e0f2fe','#0369a1'),('#fce7f3','#be185d')]
random.seed(7); nums=list(range(1,26)); random.shuffle(nums)
cel=158*S; gap=18*S; x0=(W-(5*cel+4*gap))//2; y0=700*S
for i,n in enumerate(nums):
    r,c=divmod(i,5); fu,bo=random.choice(CORES)
    x=x0+c*(cel+gap); y=y0+r*(cel+gap)
    tile=Image.new('RGBA',(cel+40*S,cel+40*S),(0,0,0,0)); t=ImageDraw.Draw(tile)
    t.rounded_rectangle((20*S+5*S,20*S+8*S,20*S+cel+5*S,20*S+cel+8*S),26*S,fill=(40,36,30,70))
    t.rounded_rectangle((20*S,20*S,20*S+cel,20*S+cel),26*S,fill=fu,outline=bo,width=7*S)
    t.text((20*S+cel/2,20*S+cel/2),str(n),font=fn,fill=(25,22,18),anchor='mm')
    tile=tile.rotate(random.uniform(-4,4),resample=Image.BICUBIC)
    im.paste(tile,(x-20*S,y-20*S),tile)
# círculo de caneta no 1
i1=nums.index(1); r,c=divmod(i1,5); cx=x0+c*(cel+gap)+cel/2; cy=y0+r*(cel+gap)+cel/2
d=ImageDraw.Draw(im)
d.ellipse((cx-115*S,cy-110*S,cx+115*S,cy+110*S),outline=(214,40,40),width=9*S)
d.text((W/2,1640*S),'@caRdeno_Amarelo',font=ImageFont.truetype(F,64*S),fill=(70,66,60),anchor='mm')
im.resize((1080,1920),Image.LANCZOS).save('capa_reels.jpg',quality=93)

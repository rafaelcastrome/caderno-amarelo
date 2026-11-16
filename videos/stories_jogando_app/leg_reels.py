from PIL import Image, ImageDraw, ImageFont
F='Caveat-Bold.ttf'
def leg(linhas, path, size=104, fill=(255,210,63,255)):
    f=ImageFont.truetype(F,size); d0=ImageDraw.Draw(Image.new('RGBA',(10,10)))
    ws=[d0.textbbox((0,0),l,font=f) for l in linhas]
    lh=int(size*1.05); w=max(b[2]-b[0] for b in ws)+90; h=lh*len(linhas)+50
    im=Image.new('RGBA',(w+20,h+24),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle((8,16,w+8,h+16),40,fill=(0,0,0,110))
    d.rounded_rectangle((0,0,w,h),40,fill=fill,outline=(25,22,18,255),width=7)
    for i,l in enumerate(linhas):
        d.text((w/2,25+lh*i+lh/2),l,font=f,fill=(25,22,18,255),anchor='mm')
    im.save(path); print(path,im.size)
leg(['Os jogos dos vídeos','agora num site!'],'r0.png')
leg(['Errei! +1 segundo'],'r1.png',fill=(255,255,255,255))
leg(['Vai, vai, vai...'],'r2.png',fill=(255,255,255,255))
leg(['Acertei! 9,3 s'],'r3.png')
leg(['Desafia teu amigo!'],'r4.png')
leg(['Teu nome e @','no ranking!'],'r5.png')
leg(['A gente reposta','o ranking!'],'r6.png')

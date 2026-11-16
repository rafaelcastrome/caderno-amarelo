from PIL import Image, ImageDraw, ImageFont
F='Caveat-Bold.ttf'
def pill(txt, size, fill, ink, path, outline=(40,36,30,255), alpha=255, pad=(34,14)):
    f=ImageFont.truetype(F,size); d0=ImageDraw.Draw(Image.new('RGBA',(10,10)))
    b=d0.textbbox((0,0),txt,font=f); w=b[2]-b[0]+2*pad[0]; h=b[3]-b[1]+2*pad[1]
    im=Image.new('RGBA',(w+12,h+14),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle((4,8,w+4,h+8),h//2,fill=(0,0,0,50))
    d.rounded_rectangle((0,0,w,h),h//2,fill=fill,outline=outline,width=4)
    d.text((w/2,h/2),txt,font=f,fill=ink,anchor='mm')
    if alpha<255:
        a=im.getchannel('A').point(lambda v:v*alpha//255); im.putalpha(a)
    im.save(path); return im.size
print(pill('@caRdeno_Amarelo',46,(255,255,255,235),(40,36,30,255),'marca.png',alpha=215,pad=(26,8)))
print(pill('Desafia teu amigo!',78,(255,210,63,255),(40,36,30,255),'t_amigo.png'))
print(pill('Teu nome e @ no ranking!',72,(255,210,63,255),(40,36,30,255),'t_ranking.png'))
print(pill('A gente reposta o ranking!',72,(255,210,63,255),(40,36,30,255),'t_reposta.png'))
# cartão final
W,H=1080,1920
im=Image.new('RGBA',(W,H),(20,18,14,150)); d=ImageDraw.Draw(im)
cx0,cy0,cx1,cy1=110,560,970,1300
d.rounded_rectangle((cx0+8,cy0+14,cx1+8,cy1+14),40,fill=(0,0,0,90))
d.rounded_rectangle((cx0,cy0,cx1,cy1),40,fill=(255,251,235,255),outline=(40,36,30,255),width=6)
for y in range(cy0+110,cy1-20,62): d.line((cx0+30,y,cx1-30,y),fill=(160,190,230,120),width=2)
d.rectangle((420,cy0-28,660,cy0+26),fill=(255,210,63,230))
f1=ImageFont.truetype(F,110); f2=ImageFont.truetype(F,64); f3=ImageFont.truetype(F,70)
d.text((540,cy0+130),'Bora jogar?',font=f1,fill=(40,36,30),anchor='mm')
d.text((540,cy0+265),'8 jogos grátis + desafio do dia',font=f2,fill=(60,56,50),anchor='mm')
d.text((540,cy0+355),'desafia teu amigo e',font=f2,fill=(60,56,50),anchor='mm')
d.text((540,cy0+425),'aparece no ranking',font=f2,fill=(60,56,50),anchor='mm')
d.rounded_rectangle((170,cy0+505,910,cy0+625),60,fill=(255,210,63),outline=(40,36,30),width=5)
d.text((540,cy0+565),'cadernoamarelo.netlify.app',font=f3,fill=(28,78,190),anchor='mm')
d.text((540,cy0+690),'toca no link do story',font=f2,fill=(214,40,40),anchor='mm')
im.save('final.png')

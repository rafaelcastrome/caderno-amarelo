import numpy as np, subprocess, math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
W,H,FPS=1080,1920,30
F=lambda s:ImageFont.truetype('Caveat-Bold.ttf',s)
def paper():
    im=Image.new('RGB',(W,H),(251,245,223)); d=ImageDraw.Draw(im)
    for x in range(30,W,54): d.line([(x,0),(x,H)],fill=(205,214,214) if (x-30)%216 else (186,201,212),width=1 if (x-30)%216 else 2)
    for y in range(30,H,54): d.line([(0,y),(W,y)],fill=(205,214,214) if (y-30)%216 else (186,201,212),width=1 if (y-30)%216 else 2)
    d.rectangle([88,0,90,H],fill=(236,170,150)); return im
CX,CY,R=540,1000,330
GRAY=(196,196,196)
base=paper(); d=ImageDraw.Draw(base)
# cartão cinza com fita
d.rounded_rectangle([60,560,1020,1440],40,fill=GRAY)
for (x,y,a) in [(120,560,-20),(960,560,20)]:
    t=Image.new('RGBA',(170,50),(245,197,24,170)).rotate(a,expand=True); base.paste(t,(x-t.width//2,y-t.height//2),t)
def state(miss):
    lay=Image.new('RGB',(W,H),(0,0,0)); ld=ImageDraw.Draw(lay)
    for i in range(12):
        if i==miss: continue
        a=2*math.pi*i/12; x=CX+R*math.cos(a); y=CY+R*math.sin(a)
        ld.ellipse([x-62,y-62,x+62,y+62],fill=(255,255,255))
    m=np.array(lay.filter(ImageFilter.GaussianBlur(22)))[...,0:1]/255.0
    b=np.array(base).astype(float); lil=np.array([224,110,224],float)
    out=b*(1-m)+lil*m; im=Image.fromarray(out.astype('uint8')); dd=ImageDraw.Draw(im)
    dd.line([(CX-28,CY),(CX+28,CY)],fill=(20,20,20),width=7); dd.line([(CX,CY-28),(CX,CY+28)],fill=(20,20,20),width=7)
    return im
states=[state(i) for i in range(12)]
def ctext(dr,y,s,size,fill):
    f=F(size); w=dr.textlength(s,font=f); dr.text(((W-w)/2,y),s,font=f,fill=fill)
DUR=26
p=subprocess.Popen(['ffmpeg','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-preset','slow','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','previa_bolinhas.mp4'],stdin=subprocess.PIPE)
cache={}
for fr in range(DUR*FPS):
    t=fr/FPS; miss=(fr//4)%12; sec=int(t)
    key=(miss,sec)
    if key not in cache:
        im=states[miss].copy(); dr=ImageDraw.Draw(im)
        ctext(dr,170,'Encara a cruz +',120,(30,30,30))
        ctext(dr,320,'e não pisca',100,(214,40,40))
        left=max(0,22-sec)
        if left>0: ctext(dr,1520,f'{left}',170,(53,103,160))
        else: ctext(dr,1530,'continua olhando...',90,(53,103,160))
        wm=['@Cardeno_Amarelo'][0]; pos=[(620,1800),(140,1800),(620,90)][(sec//8)%3]
        dr.text(pos,wm,font=F(52),fill=(150,140,120))
        cache={key:im}
    p.stdin.write(cache[key].tobytes())
p.stdin.close(); p.wait()

import numpy as np, subprocess, math, json
from PIL import Image, ImageDraw, ImageFilter, ImageFont
W,H,FPS=1080,1920,30
F=lambda s:ImageFont.truetype('Caveat-Bold.ttf',s)
# falas: (arquivo, ini, fim, posição no vídeo)
FALAS=[('take1',0.00,3.10,0.3),('take1',3.10,5.71,3.6),('take1',5.71,8.13,6.5),
       ('take1',11.87,13.07,9.6),('take1',16.64,17.22,18.3),('take1',20.90,24.66,22.0),
       ('take2',0.00,1.02,26.8),('take2',1.02,3.65,28.3),('take2',3.65,6.43,31.6),
       ('take2',6.86,10.73,34.8),('take2',11.13,14.31,39.2),('take2',14.68,18.30,43.0)]
DUR=47.5
PARA=30.0   # "olha isso": a roda para e mostra as 12
VOLTA=43.0  # volta a rodar pra emendar no início
def paper():
    im=Image.new('RGB',(W,H),(251,245,223)); d=ImageDraw.Draw(im)
    for x in range(30,W,54): d.line([(x,0),(x,H)],fill=(205,214,214) if (x-30)%216 else (186,201,212),width=1 if (x-30)%216 else 2)
    for y in range(30,H,54): d.line([(0,y),(W,y)],fill=(205,214,214) if (y-30)%216 else (186,201,212),width=1 if (y-30)%216 else 2)
    d.rectangle([88,0,90,H],fill=(236,170,150)); return im
CX,CY,R=540,1000,330
base=paper(); d=ImageDraw.Draw(base)
d.rounded_rectangle([60,560,1020,1440],40,fill=(196,196,196))
for (x,y,a) in [(120,560,-20),(960,560,20)]:
    t=Image.new('RGBA',(170,50),(245,197,24,170)).rotate(a,expand=True); base.paste(t,(x-t.width//2,y-t.height//2),t)
def state(miss):
    lay=Image.new('L',(W,H),0); ld=ImageDraw.Draw(lay)
    for i in range(12):
        if i==miss: continue
        a=2*math.pi*i/12; x=CX+R*math.cos(a); y=CY+R*math.sin(a)
        ld.ellipse([x-62,y-62,x+62,y+62],fill=255)
    m=np.array(lay.filter(ImageFilter.GaussianBlur(22)))[...,None]/255.0
    out=np.array(base).astype(float)*(1-m)+np.array([224,110,224],float)*m
    im=Image.fromarray(out.astype('uint8')); dd=ImageDraw.Draw(im)
    dd.line([(CX-28,CY),(CX+28,CY)],fill=(20,20,20),width=7); dd.line([(CX,CY-28),(CX,CY+28)],fill=(20,20,20),width=7)
    return im
states=[state(i) for i in range(12)]+[state(-1)]
INK=(30,30,30); RED=(214,40,40); BLUE=(53,103,160); GREEN=(40,150,70); PINK=(200,70,200)
def txt(s,size,fill):
    f=F(size); l,t,r,b=f.getbbox(s); im=Image.new('RGBA',(r-l+20,b-t+30),(0,0,0,0))
    ImageDraw.Draw(im).text((10-l,10-t),s,font=f,fill=fill); return im
# (ini, fim, y, texto, tamanho, cor)  — escrita da esquerda pra direita em 0.5 s
T=[(-1,22.0,170,'Encara a cruz +',120,INK),(-1,22.0,320,'e não pisca',100,RED),
   (22.0,30.0,190,'De que cor é a bolinha',96,INK),(22.0,30.0,320,'que tá rodando?',96,INK),
   (27.0,30.0,1500,'Verde, né?',150,GREEN),
   (30.0,34.8,190,'Olha agora...',110,INK),(31.6,34.8,1490,'Nenhuma verde!',140,RED),(32.6,34.8,1650,'nunca teve verde aqui',110,RED),
   (34.8,43.0,170,'Teu olho cansa do rosa...',96,PINK),(36.4,43.0,300,'e no buraco pinta o contrário',84,GREEN),
   (39.2,43.0,1490,'O que não muda,',100,INK),(40.4,43.0,1610,'o cérebro apaga',100,RED),
   (43.0,DUR,170,'Viu o verde?',130,GREEN),(43.6,DUR,320,'Comenta!',110,INK),
   (44.6,DUR,1500,'Não viu? Volta',120,BLUE),(45.6,DUR,1650,'e não pisca!',120,RED)]
T=[(a,b,y,txt(s,sz,c)) for a,b,y,s,sz,c in T]
WM=txt('@Cardeno_Amarelo',52,(150,140,120))
def frame(fr):
    t=fr/FPS
    if PARA<=t<VOLTA: miss=12
    else: miss=(fr//4)%12
    im=states[miss].copy()
    for a,b,y,img in T:
        if a<=t<b:
            p=min(1,(t-a)/0.5); w=max(1,int(img.width*p)); c=img.crop((0,0,w,img.height))
            im.paste(c,((W-img.width)//2,y),c)
    if 2<=t<21.5:
        n=max(1,20-int(t-2)); img=txt(str(n),170,BLUE); im.paste(img,((W-img.width)//2,1500),img)
    pos=[(600,1830),(130,1830),(600,40),(130,40)][int(t//7)%4]
    im.paste(WM,pos,WM); return im
if __name__=='__main__':
    import sys
    if len(sys.argv)>1:
        [frame(int(float(s)*FPS)).save(f'prev_{s}.png') for s in sys.argv[1:]]; sys.exit()
    # áudio
    inp=[];flt=[]
    for i,(arq,a,b,pos) in enumerate(FALAS):
        inp+=['-i',f'falas/{arq}.wav']
        flt.append(f'[{i}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=48000,adelay={int(pos*1000)}:all=1[a{i}]')
    flt.append(''.join(f'[a{i}]' for i in range(len(FALAS)))+f'amix=inputs={len(FALAS)}:normalize=0,apad,atrim=0:{DUR},loudnorm=I=-15:TP=-1.5[out]')
    subprocess.run(['ffmpeg','-y','-v','error',*inp,'-filter_complex',';'.join(flt),'-map','[out]','-ar','48000','narracao.wav'],check=True)
    p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i','narracao.wav',
        '-c:v','libx264','-preset','slow','-crf','26','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart','bolinhas_somem.mp4'],stdin=subprocess.PIPE)
    for fr in range(int(DUR*FPS)): p.stdin.write(frame(fr).tobytes())
    p.stdin.close(); p.wait()

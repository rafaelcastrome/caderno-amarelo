#!/usr/bin/env python3
"""Tu trocaria de porta? (Monty Hall). Frames em PIL sobre a narração falas/take1.wav acelerada (TEMPO).
uso: python3 video.py  -> tres_portas.mp4"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np, subprocess, math, wave
W,H,FPS=720,1280,30
TEMPO=1.12
HERE=__file__.rsplit('/',1)[0] or '.'
F=lambda s: ImageFont.truetype(f'{HERE}/Caveat-Bold.ttf',s)
EM=ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf',109)
def emoji(ch,size):
    im=Image.new('RGBA',(140,130),(0,0,0,0)); ImageDraw.Draw(im).text((0,0),ch,font=EM,embedded_color=True)
    return im.crop(im.getbbox()).resize((size,size),Image.LANCZOS)
GOAT=emoji('🐐',150); CAR=emoji('🚗',150); GOATs=emoji('🐐',70); CARs=emoji('🚗',70); PC=emoji('💻',170)
K=(30,30,40);R=(215,30,30);G=(30,140,60);WOOD=(190,120,60)
def paper():
    im=Image.new('RGB',(W,H),(255,236,140)); d=ImageDraw.Draw(im)
    for y in range(160,H,48): d.line([(0,y),(W,y)],fill=(140,180,220),width=2)
    d.line([(90,0),(90,H)],fill=(220,80,80),width=3); return im
PAPER=paper()
def txt(d,y,s,sz,col=K,x=None):
    for line in s.split('\n'):
        f=F(sz); w=d.textlength(line,font=f); d.text(((W-w)/2 if x is None else x,y),line,font=f,fill=col); y+=int(sz*1.05)
def pop(t,t0,d=0.25): return max(0,min(1,(t-t0)/d))
# tempos originais do take (s) -> divididos por TEMPO
T=dict(hook=0,erra=1.86,atras=4.04,tua=8.94,apres=10.37,abre=13.6,bode=14.76,troca=15.70,pensa=19.4,
       tanto=21.44,errou=23.7,ganha=26.96,terco=30.6,outros=33.69,mostra=36.6,acred=39.99,cem=41.2,abre98=44.08,
       sobrou=47.35,ainda=49.5,mat=52.27,comenta=57.34,fim=59.44)
T={k:v/TEMPO for k,v in T.items()}
DUR=T['fim']+1.0
def doors(im,t,sel=None,open3=None,labels=None,y=520):
    d=ImageDraw.Draw(im)
    for i in range(3):
        x=40+i*220; w,h=200,330
        a=0
        if i==2 and open3 is not None: a=min(1,max(0,(t-open3)/0.5))
        if a>0:
            d.rectangle([x,y,x+w,y+h],fill=(250,248,235),outline=K,width=6)
            if a>0.4: im.paste(GOAT,(x+25,y+110),GOAT)
            dw=int(w*(1-a)); 
            if dw>4: d.rectangle([x,y,x+dw,y+h],fill=WOOD,outline=K,width=6)
            d.polygon([(x,y),(x-int(30*a),y+25),(x-int(30*a),y+h+15),(x,y+h)],fill=(160,100,50),outline=K)
        else:
            d.rectangle([x,y,x+w,y+h],fill=WOOD,outline=K,width=6)
            d.rectangle([x+25,y+25,x+w-25,y+h/2-15],outline=(150,90,40),width=4)
            d.rectangle([x+25,y+h/2+15,x+w-25,y+h-25],outline=(150,90,40),width=4)
            d.ellipse([x+w-42,y+h/2-10,x+w-22,y+h/2+10],fill=(250,210,60),outline=K,width=3)
            f=F(110); s=str(i+1); tw=d.textlength(s,font=f); d.text((x+w/2-tw/2,y+70),s,font=f,fill=(255,240,200))
        if sel==i+1:
            d.rectangle([x-12,y-12,x+w+12,y+h+12],outline=R,width=8)
            d.text((x+55,y+h+25),"TUA",font=F(60),fill=R)
        if labels and labels[i]:
            s,col=labels[i]; f=F(80); tw=d.textlength(s,font=f); d.text((x+w/2-tw/2,y-110),s,font=f,fill=col)
def cem(im,t):
    d=ImageDraw.Draw(im)
    for k in range(100):
        r,c=divmod(k,10); x=70+c*60; y=360+r*72
        # ordem de abertura embaralhada
        oi=ORD[k]
        op= k not in (0,36) and t>T['abre98']+oi*(2.6/TEMPO/98)
        hl = k==36 and t>T['sobrou']
        d.rectangle([x,y,x+48,y+62],fill=(250,248,235) if op else WOOD,outline=R if k==0 else ((30,140,60) if hl else K),width=5 if (k==0 or hl) else 2)
        if op: im.paste(GOATm,(x+6,y+14),GOATm)
        else: d.text((x+6 if k<9 else x+4,y+12),str(k+1),font=F(34 if k<99 else 26),fill=(255,240,200))
GOATm=emoji('🐐',36)
rng=np.random.default_rng(5); perm=rng.permutation(100); ORD=np.empty(100,int); ORD[perm]=np.arange(100)
def frame(t):
    im=PAPER.copy(); d=ImageDraw.Draw(im)
    if t<T['tanto']:
        if t<T['atras']:
            txt(d,190,"Tu trocaria\nde porta?",110)
            if t>T['erra']: txt(d,920,"quase todo mundo erra!",64,R)
            doors(im,t)
        else:
            sel=1 if t>T['tua'] else None
            o3=T['abre'] if t>T['abre'] else None
            if t<T['tua']:
                im.paste(CARs,(200,200),CARs); txt(d,195,"= 1 CARRO",64,K,x=290)
                im.paste(GOATs,(200,300),GOATs); txt(d,295,"= 2 BODES",64,K,x=290)
            elif t<T['apres']: txt(d,230,"Tu escolheu a porta 1",70)
            elif t<T['bode']: txt(d,200,"O apresentador sabe\nonde tá o carro...",64)
            elif t<T['troca']:
                s=1+0.25*max(0,1-(t-T['bode'])/0.3); txt(d,220,"BODE!",int(110*s),R)
            else:
                txt(d,180,"TROCA pra 2\nou FICA na 1?",84)
            doors(im,t,sel=sel,open3=o3)
            if t>T['pensa']-1.2:
                n=3-int((t-(T['pensa']-1.2))/((T['tanto']-T['pensa']+1.2)/3))
                if n>0: txt(d,960,str(n),130,R)
    elif t<T['ganha']:
        txt(d,250,"\"Tanto faz,\né 50%\"",100)
        if t>T['errou']:
            a=pop(t,T['errou']); d.line([(140,260),(140+440*a,260+380*a)],fill=R,width=18); d.line([(580,260),(580-440*a,260+380*a)],fill=R,width=18)
            txt(d,720,"ERROU!",130,R)
    elif t<T['terco']:
        txt(d,240,"Quem TROCA ganha",84); txt(d,370,"2 em cada 3",120,G)
        for i in range(3):
            x=130+i*170; im.paste(CARs if i<2 else GOATs,(x,640),CARs if i<2 else GOATs)
            txt(d,720,"",10)
        txt(d,760,"trocando",60,K)
    elif t<T['acred']:
        lab=[("1/3",R),None,None]
        if t>T['outros']: lab=[("1/3",R),("2/3",G),("2/3",G)] if t<T['mostra'] else [("1/3",R),("2/3",G),None]
        doors(im,t,sel=1,open3=T['mostra'],labels=lab,y=560)
        if T['outros']<t<T['mostra']:
            d.line([(260,450),(700,450)],fill=G,width=6); d.line([(260,450),(260,480)],fill=G,width=6); d.line([(700,450),(700,480)],fill=G,width=6)
        txt(d,200,"Quando tu escolheu..." if t<T['outros'] else "As outras duas juntas...",64)
    elif t<T['ainda']:
        txt(d,180,"Imagina 100 portas" if t<T['abre98'] else ("98 bodes..." if t<T['sobrou'] else "Sobrou a 37!"),76, G if t>T['sobrou'] else K)
        cem(im,t)
    elif t<T['mat']:
        txt(d,200,"Tu ainda ficaria\nna tua?",90)
        for i,(n,col) in enumerate([("1",R),("37",G)]):
            x=150+i*260; d.rectangle([x,560,x+160,830],fill=WOOD,outline=col,width=10)
            f=F(110); tw=d.textlength(n,font=f); d.text((x+80-tw/2,620),n,font=f,fill=(255,240,200))
        for i,(s_,col) in enumerate([("1 em 100",R),("99 em 100",G)]):
            f=F(54); tw=d.textlength(s_,font=f); d.text((230+i*260-tw/2,860),s_,font=f,fill=col)
    elif t<T['comenta']:
        txt(d,200,"Paul Erdős,\num dos maiores\nmatemáticos do mundo,",64)
        im.paste(PC,(275,560),PC)
        txt(d,780,"só acreditou vendo\nno computador!",70,R)
    else:
        txt(d,260,"Comenta:",90); txt(d,420,"TROCA",150,G); txt(d,600,"ou",80); txt(d,700,"FICA?",150,R)
    # marca d'água andando
    wx=220+190*math.sin(t*0.35); wy=1150+40*math.sin(t*0.6)
    d.text((wx,wy),"@Cardeno_Amarelo",font=F(42),fill=(140,115,50))
    return im
# ---- áudio: narração acelerada + efeitos tonais
SR=44100
subprocess.run(['ffmpeg','-v','error','-y','-i',f'{HERE}/falas/take1.wav','-af',f'atempo={TEMPO}','-ar',str(SR),'-ac','1',f'{HERE}/narracao.wav'],check=True)
with wave.open(f'{HERE}/narracao.wav') as w: voz=np.frombuffer(w.readframes(w.getnframes()),np.int16)/32768
mix=np.zeros(int(DUR*SR)+SR); mix[:len(voz)]+=voz
def tone(f,d,dec=8,amp=0.25,f2=None):
    tt=np.arange(int(d*SR))/SR; fr=f if f2 is None else np.linspace(f,f2,len(tt))
    return np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-tt*dec)*amp
def add(t,s,):
    i=int(t*SR); mix[i:i+len(s)]+=s[:len(mix)-i]
add(T['abre'],tone(300,0.5,5,0.12,180))           # porta rangendo (tom descendo)
add(T['bode'],tone(520,0.12,20,0.2)); add(T['bode']+0.12,tone(390,0.25,10,0.2))
n0=T['pensa']-1.2; step=(T['tanto']-T['pensa']+1.2)/3
for k in range(3): add(n0+k*step,tone(1300,0.06,60,0.25))
add(T['errou'],tone(140,0.5,4,0.25)+tone(147,0.5,4,0.2))
add(T['ganha'],tone(880,0.4,6,0.18)); add(T['ganha']+0.12,tone(1320,0.5,6,0.15))
for k in range(98): add(T['abre98']+k*(2.6/TEMPO/98),tone(900+k*6,0.03,90,0.08))
add(T['sobrou'],tone(660,0.3,6,0.18)); add(T['sobrou']+0.1,tone(990,0.4,6,0.15))
mix=np.clip(mix,-1,1)
with wave.open(f'{HERE}/audio.wav','wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',f'{HERE}/audio.wav',
   '-c:v','libx264','-preset','slow','-crf','26','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',f'{HERE}/tres_portas.mp4'],stdin=subprocess.PIPE)
for i in range(int(DUR*FPS)): p.stdin.write(frame(i/FPS).tobytes())
p.stdin.close(); p.wait()

# Trilha motivacional original sintetizada (piano + pad + cordas + pulso), livre de direitos.
import numpy as np, scipy.io.wavfile as wf, scipy.signal as sg, sys
SR=44100; TOT=91.4; N=int(TOT*SR)
rng=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
def hz(m): return 440*2**((m-69)/12)
def add(sig,t0,gain=1.0,pan=0.0):
    i=int(t0*SR); j=min(N,i+len(sig))
    if j<=i: return
    s=sig[:j-i]*gain
    L[i:j]+=s*np.sqrt(0.5*(1-pan)); R[i:j]+=s*np.sqrt(0.5*(1+pan))
def piano(m,dur=2.5,vel=1.0):
    t=np.arange(int((dur+1.0)*SR))/SR; f=hz(m); y=np.zeros_like(t)
    for k in range(1,9):
        fk=f*k*np.sqrt(1+0.0004*k*k)
        if fk>16000: break
        y+=np.sin(2*np.pi*fk*t)*(1/k**1.3)*np.exp(-t*(0.9+0.45*k)*(1+ (m-60)/60))
    env=np.minimum(1,t/0.004)*np.where(t<dur,1,np.exp(-(t-dur)*8))
    return y*env*vel*0.35
def pad(ms,dur,att=1.5,rel=1.5,bright=4.0):
    t=np.arange(int((dur+rel)*SR))/SR; y=np.zeros_like(t)
    for m in ms:
        for det in (-0.08,0,0.08):
            f=hz(m+det)
            for k in range(1,14):
                if f*k>9000: break
                y+=np.sin(2*np.pi*f*k*t+rng.uniform(0,6.28))*(1/k)*np.exp(-k/bright)
    env=np.minimum(1,t/att)*np.where(t<dur,1,np.exp(-(t-dur)*3/rel))
    return y*env/ (len(ms)*3)*0.5
def strings_bass(m,dur):
    t=np.arange(int((dur+0.8)*SR))/SR; f=hz(m)
    y=np.sin(2*np.pi*f*t)+0.35*np.sin(2*np.pi*2*f*t)+0.12*np.sin(2*np.pi*3*f*t)
    env=np.minimum(1,t/0.4)*np.where(t<dur,1,np.exp(-(t-dur)*5))
    return y*env*0.11
def kick():
    t=np.arange(int(0.5*SR))/SR; f=45+80*np.exp(-t*25)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*7)*0.45
def lvl(t, pts):  # automação de volume por pontos (t, g)
    xs,ys=zip(*pts); return float(np.interp(t,xs,ys))

BPM=72; beat=60/BPM; bar=4*beat
# Am  F  C  G   (vi IV I V em Dó)
prog=[(57,[57,60,64]),(53,[53,57,60]),(48,[52,55,60]),(55,[55,59,62])]
arp_pat=[0,1,2,1,3,2,1,2]   # índices sobre [raiz+12, terça, quinta, oitava]
BREAK0, CLIMAX=76.3, 80.8
t=0.0; b=0
while t < BREAK0-0.01:
    root,ch=prog[b%4]
    notes=[ch[0]+12,ch[1]+12,ch[2]+12,ch[0]+24]
    # pad sempre
    add(pad([n+12 for n in ch],bar,att=1.2,rel=1.2), t, gain=lvl(t,[(0,0.55),(35,0.7),(54,0.9),(76,1.1)]))
    # arpejo de piano (colcheias)
    pv=lvl(t,[(0,0.75),(36,0.85),(54,1.0),(76,1.05)])
    for i,ix in enumerate(arp_pat):
        tt=t+i*beat/2
        if tt>=BREAK0: break
        add(piano(notes[ix],dur=beat*0.9,vel=pv*(1.0 if i%4==0 else 0.75)), tt, pan=(-0.3 if i%2 else 0.3))
    # cordas graves a partir de 16.6
    if t>=16.0:
        add(strings_bass(root-12,bar), t, gain=lvl(t,[(16,0.6),(54,1.0),(76,1.2)]))
    # pulso (batida de coração) a partir de 35.8; toda batida a partir de 53.8
    if t>=35.0:
        for k in range(4):
            tk=t+k*beat
            if tk>=BREAK0-0.2: break
            if t>=53.0 or k in (0,2):
                add(kick(), tk, gain=0.55 if t<53 else 0.75)
    # melodia alta (brilho) a partir de 53.8
    if t>=53.0:
        mel=[ch[2]+24, ch[1]+24, ch[0]+24, ch[1]+24]
        for k,m in enumerate(mel):
            add(piano(m,dur=beat*1.6,vel=0.5), t+k*beat, pan=0.1)
        add(pad([n+24 for n in ch],bar,att=0.8,rel=1.0,bright=6), t, gain=0.35)
    t+=bar; b+=1
# pausa: só um "riser" que cresce até o clímax
rt=np.arange(int((CLIMAX-BREAK0)*SR))/SR
noise=sg.lfilter(*sg.butter(2,[800/(SR/2),6000/(SR/2)],'band'),rng.standard_normal(len(rt)))
riser=noise*(rt/rt[-1])**2.5*0.18
riser+=pad([60,64,67,72],CLIMAX-BREAK0,att=CLIMAX-BREAK0,rel=0.05)[:len(rt)]*0.8
add(riser,BREAK0)
add(piano(45,dur=3.5,vel=0.9),BREAK0+0.05); add(piano(57,dur=3.5,vel=0.6),BREAK0+0.05)
# clímax: F - G - C (cada 1 compasso mais curto), depois Dó sustentado
cl=[(53,[53,57,60,65]),(55,[55,59,62,67]),(48,[52,55,60,64])]
seg=(86.4-CLIMAX)/3
for i,(root,ch) in enumerate(cl):
    tc=CLIMAX+i*seg
    add(kick(),tc,gain=0.9)
    add(pad([n+12 for n in ch],seg,att=0.25,rel=0.8,bright=6),tc,gain=1.25)
    add(strings_bass(root-12,seg),tc,gain=1.3)
    for n in ch: add(piano(n+12,dur=seg,vel=0.8),tc)
    for k in range(int(seg/(beat/2))):
        add(piano(ch[k%4]+24,dur=beat*0.8,vel=0.55),tc+k*beat/2,pan=(0.25 if k%2 else -0.25))
# final: Dó maior aberto, sumindo
add(pad([60,64,67,72,76],TOT-86.4,att=0.3,rel=2.0,bright=5),86.4,gain=1.1)
add(strings_bass(36,TOT-86.4),86.4,gain=1.0)
for n in (48,60,64,67,72): add(piano(n,dur=4.5,vel=0.7),86.4)
# reverb
ir_t=np.arange(int(2.8*SR))/SR
def ir(): return rng.standard_normal(len(ir_t))*np.exp(-ir_t/0.9)*np.minimum(1,ir_t/0.01)
hp=sg.butter(2,40/(SR/2),"high",output="sos"); L=sg.sosfilt(hp,L); R=sg.sosfilt(hp,R)
wl=sg.fftconvolve(L,ir())[:N]; wr=sg.fftconvolve(R,ir())[:N]
wl/=np.abs(wl).max(); wr/=np.abs(wr).max()
dry=max(np.abs(L).max(),np.abs(R).max())
outL=L/dry*0.75+wl*0.35; outR=R/dry*0.75+wr*0.35
fade=np.ones(N); fn=int(3.0*SR); fade[-fn:]=np.linspace(1,0,fn)**2
fade[:int(0.5*SR)]=np.linspace(0,1,int(0.5*SR))
out=np.stack([outL*fade,outR*fade],1); out/=np.abs(out).max()/0.9
wf.write(sys.argv[1],SR,(out*32767).astype(np.int16))

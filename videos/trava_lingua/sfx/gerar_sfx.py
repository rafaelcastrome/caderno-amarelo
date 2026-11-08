# tiques tonais de cronômetro (sem ruído branco) + plim final
import numpy as np
from scipy.io import wavfile
SR=44100
def tom(f,d,a=0.5,dec=30):
    t=np.arange(int(d*SR))/SR; return a*np.sin(2*np.pi*f*t)*np.exp(-dec*t)
def crono(seg,nome):
    x=np.zeros(int((seg+0.6)*SR))
    for k in range(int(seg*2)):
        f=1400 if k%2==0 else 1050
        if k>=seg*2-6: f=1700
        s=tom(f,0.06,0.35,60); i=int(k*0.5*SR); x[i:i+len(s)]+=s
    s=tom(880,0.6,0.5,6)+tom(1320,0.6,0.3,6); i=int(seg*SR); x[i:i+len(s)]+=s
    wavfile.write(nome,SR,(x/np.max(np.abs(x))*0.8*32767).astype(np.int16))
for n,s in [('n1',7),('n2',7),('n3',7)]: crono(s,f'sfx/{n}.wav')

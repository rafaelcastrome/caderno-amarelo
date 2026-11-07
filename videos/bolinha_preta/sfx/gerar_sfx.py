# 4 tiques tonais (contagem 4-3-2-1), sem ruído branco
import numpy as np; from scipy.io import wavfile
SR=44100
def tick(f):
    t=np.arange(int(0.08*SR))/SR
    return (np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*2*f*t))*np.exp(-t*50)*0.5
x=np.zeros(int(4*SR))
for i in range(4):
    a=int(i*SR); k=tick(1200 if i<3 else 1600); x[a:a+len(k)]+=k
wavfile.write('sfx/conta.wav',SR,(x*32767).astype(np.int16))

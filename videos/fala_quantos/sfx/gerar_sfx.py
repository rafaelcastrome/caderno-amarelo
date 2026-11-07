# tique tonal (sem ruído branco) a cada item dos níveis
import numpy as np; from scipy.io import wavfile
SR=44100
def tick(f=1300):
    t=np.arange(int(0.07*SR))/SR
    return (np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*2*f*t))*np.exp(-t*55)*0.5
for nome,n,dt in [('n1',4,0.65),('n2',6,0.9),('n3',7,1.1)]:
    x=np.zeros(int(n*dt*SR))
    for i in range(n):
        a=int(i*dt*SR); k=tick(1300 if nome!='n3' else 1500); x[a:a+len(k)]+=k
    wavfile.write(f'sfx/{nome}.wav',SR,(x*32767).astype(np.int16))

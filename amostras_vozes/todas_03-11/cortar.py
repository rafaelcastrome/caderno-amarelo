import wave, numpy as np, subprocess
pares = {1:('Kore','Fenrir')}
for l in open('pares.txt'):
    n,a,b = l.split(); pares[int(n)] = (a,b)
pares.update({12:('Achird','Zubenelgenubi'),13:('Vindemiatrix','Sadachbia'),14:('Sadaltager','Sulafat')})
for n,(a,b) in sorted(pares.items()):
    w = wave.open(f'par{n:02d}.wav'); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float); sr = w.getframerate()
    hop = sr//100; e = np.array([np.sqrt(np.mean(x[i:i+hop]**2)+1) for i in range(0,len(x)-hop,hop)])
    win = 25; s = np.convolve(e, np.ones(win)/win, 'valid')
    lo, hi = int(len(s)*.35), int(len(s)*.65); k = lo + int(np.argmin(s[lo:hi])) + win//2
    t = k/100
    for v, ss, to in ((a, 0, t), (b, t, len(x)/sr)):
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'par{n:02d}.wav','-ss',str(ss),'-to',str(to),'-af','silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5','-ar','44100',f'gem_{v}.wav'])
    print(n, a, b, t, len(x)/sr)

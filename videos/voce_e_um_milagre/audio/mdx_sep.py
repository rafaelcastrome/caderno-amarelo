import sys, numpy as np, onnxruntime as ort, scipy.io.wavfile as wf
model, inp, out_voc, out_inst = sys.argv[1:5]
n_fft, hop, dim_f, dim_t, comp = 7680, 1024, 3072, 256, 1.021
sr, x = wf.read(inp); x = x.astype(np.float32).T / 32768.0  # (2,N)
N = x.shape[1]
chunk = hop*(dim_t-1); trim = n_fft//2; gen = chunk - 2*trim
pad = gen - N % gen
mp = np.concatenate([np.zeros((2,trim),np.float32), x, np.zeros((2,pad),np.float32), np.zeros((2,trim),np.float32)],1)
win = (0.5-0.5*np.cos(2*np.pi*np.arange(n_fft)/n_fft)).astype(np.float32)
def stft(w):  # (2,chunk)->(2,F,T)
    p = np.pad(w, ((0,0),(n_fft//2,n_fft//2)), mode='reflect')
    T = 1 + (p.shape[1]-n_fft)//hop
    idx = np.arange(n_fft)[None,:] + hop*np.arange(T)[:,None]
    fr = p[:, idx] * win  # (2,T,n_fft)
    return np.fft.rfft(fr, axis=-1).transpose(0,2,1)  # (2,F,T)
def istft(S, L):
    fr = np.fft.irfft(S.transpose(0,2,1), n=n_fft, axis=-1) * win  # (2,T,n_fft)
    T = fr.shape[1]; outl = n_fft + hop*(T-1)
    y = np.zeros((2,outl),np.float32); ws = np.zeros(outl,np.float32)
    for t in range(T):
        y[:, t*hop:t*hop+n_fft] += fr[:,t]; ws[t*hop:t*hop+n_fft] += win**2
    y = y/np.maximum(ws,1e-8)
    return y[:, n_fft//2:n_fft//2+L]
sess = ort.InferenceSession(model)
res = []
for i in range(0, mp.shape[1]-2*trim, gen):
    w = mp[:, i:i+chunk]
    S = stft(w)[:, :dim_f]  # (2,3072,256)
    inpx = np.stack([S[0].real, S[0].imag, S[1].real, S[1].imag])[None].astype(np.float32)
    o = sess.run(None, {'input': inpx})[0][0]
    full = np.zeros((2, n_fft//2+1, dim_t), np.complex64)
    full[0,:dim_f] = o[0]+1j*o[1]; full[1,:dim_f] = o[2]+1j*o[3]
    y = istft(full, chunk)
    res.append(y[:, trim:chunk-trim])
    print(i, file=sys.stderr)
voc = np.concatenate(res,1)[:, :N] * comp
inst = x - voc
for f,a in ((out_voc,voc),(out_inst,inst)):
    wf.write(f, sr, (np.clip(a,-1,1).T*32767).astype(np.int16))

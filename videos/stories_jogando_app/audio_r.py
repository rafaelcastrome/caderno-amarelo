import json, numpy as np, subprocess, wave
SR=48000; LEAD=3.0; DUR=49.0
def ler(path):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',path,'-ar',str(SR),'-ac','1','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).copy()
take=ler('voz/take_r.wav')
def seg(a,b,cortes=()):
    x=take[int(a*SR):int(b*SR)].copy()
    for (c0,c1) in sorted(cortes,reverse=True):
        i0,i1=int((c0-a)*SR),int((c1-a)*SR); x=np.concatenate([x[:i0],np.zeros(int(0.12*SR),np.float32),x[i1:]])
    f=int(0.015*SR); x[:f]*=np.linspace(0,1,f); x[-f:]*=np.linspace(1,0,f); return x
# (inicio no vídeo, trecho do take)
falas=[
 (0.05, seg(0.0,2.52)),
 (2.60, seg(4.00,5.18)),
 (5.25, seg(6.92,7.40)),
 (8.90, seg(8.64,10.30)),
 (10.60,seg(11.45,14.66)),
 (14.55,seg(15.87,20.50)),
 (19.30,seg(21.62,22.80)),
]
out=np.zeros(int(DUR*SR),np.float32)
fim_ant=0
for t,x in falas:
    assert t>=fim_ant-0.01, (t,fim_ant)
    i=int(t*SR); out[i:i+len(x)]+=x; fim_ant=t+len(x)/SR
    print(round(t,2),'->',round(fim_ant,2))
voz=out.copy()
# sons do jogo (mesmas notas do app)
NOTAS={'certo':[[660,0,.07],[990,.06,.09]],'errado':[[180,0,.18]],'tique':[[1200,0,.03]],'valendo':[[523,0,.1],[784,.1,.16]],'fim':[[784,0,.12],[659,.12,.12],[523,.24,.25]],'desafiar':[[880,0,.05]]}
d=json.load(open('qr/dados.json')); t0=d['marcas'][0][1]
sfx=np.zeros_like(out)
for nome,t in d['ev']:
    for f,o,du in NOTAS.get(nome,[]):
        i=int((t-t0+LEAD+o)*SR); n=int(du*SR); tt=np.arange(n)/SR
        if i<0 or i+n>len(sfx): continue
        tom=(np.sin(2*np.pi*f*tt) if nome!='errado' else np.sign(np.sin(2*np.pi*f*tt))*0.5)*np.exp(-tt*8)
        a=min(int(0.004*SR),n); tom[:a]*=np.linspace(0,1,a)
        sfx[i:i+n]+=tom.astype(np.float32)*0.16
mix=voz/ max(1e-6,np.abs(voz).max())*0.85 + sfx
mix=np.clip(mix,-1,1)
with wave.open('audio_r.wav','wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype(np.int16).tobytes())

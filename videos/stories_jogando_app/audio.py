import json, numpy as np, subprocess, wave
SR=48000; LEAD=3.0; DUR=49.0
def ler(path):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',path,'-ar',str(SR),'-ac','1','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).copy()
take=ler('voz/take.wav')
gancho=ler('voz/gancho.wav')[:int(8.50*SR)]
def seg(a,b,cortes=()):
    x=take[int(a*SR):int(b*SR)].copy()
    for (c0,c1) in sorted(cortes,reverse=True):
        i0,i1=int((c0-a)*SR),int((c1-a)*SR); x=np.concatenate([x[:i0],np.zeros(int(0.12*SR),np.float32),x[i1:]])
    f=int(0.015*SR); x[:f]*=np.linspace(0,1,f); x[-f:]*=np.linspace(1,0,f); return x
# (inicio no vídeo, trecho do take)
falas=[
 (8.65-7.4, seg(0.0,5.30)),
 (6.95, seg(7.62,9.78,[(8.20,9.18)])),
 (9.95, seg(10.97,12.72)),
 (13.55,seg(13.56,15.42)),
 (16.25,seg(16.03,16.72)),
 (18.30,seg(17.49,18.78)),
 (22.10,seg(19.84,21.33)),
 (23.65,seg(22.19,25.50,[(24.0,24.55)])),
 (26.55,seg(26.17,32.46)),
 (32.95,seg(32.78,36.00)),
 (36.35,seg(36.34,38.96)),
 (39.05,seg(39.42,40.96)),
]
falas=[(t+7.4,x) for t,x in falas]
f=int(0.02*SR); gancho[-f:]*=np.linspace(1,0,f)
falas.insert(0,(0.10,gancho))
out=np.zeros(int(DUR*SR),np.float32)
fim_ant=0
for t,x in falas:
    assert t>=fim_ant-0.01, (t,fim_ant)
    i=int(t*SR); out[i:i+len(x)]+=x; fim_ant=t+len(x)/SR
    print(round(t,2),'->',round(fim_ant,2))
voz=out.copy()
# sons do jogo (mesmas notas do app)
NOTAS={'certo':[[660,0,.07],[990,.06,.09]],'errado':[[180,0,.18]],'tique':[[1200,0,.03]],'valendo':[[523,0,.1],[784,.1,.16]],'fim':[[784,0,.12],[659,.12,.12],[523,.24,.25]],'desafiar':[[880,0,.05]]}
d=json.load(open('q/dados.json')); t0=d['marcas'][0][1]
sfx=np.zeros_like(out)
for nome,t in d['ev']:
    for f,o,du in NOTAS.get(nome,[]):
        i=int((t-t0+LEAD+o)*SR); n=int(du*SR); tt=np.arange(n)/SR
        tom=(np.sin(2*np.pi*f*tt) if nome!='errado' else np.sign(np.sin(2*np.pi*f*tt))*0.5)*np.exp(-tt*8)
        a=min(int(0.004*SR),n); tom[:a]*=np.linspace(0,1,a)
        sfx[i:i+n]+=tom.astype(np.float32)*0.16
mix=voz/ max(1e-6,np.abs(voz).max())*0.85 + sfx
mix=np.clip(mix,-1,1)
with wave.open('audio.wav','wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype(np.int16).tobytes())

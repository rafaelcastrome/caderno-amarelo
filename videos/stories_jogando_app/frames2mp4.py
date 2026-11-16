import json,sys,subprocess
d=json.load(open(sys.argv[1]+'/dados.json'));q=d['quadros'];t0=d['marcas'][0][1]
L=[]
for i,(n,t) in enumerate(q):
    if t<t0-0.05: continue
    nt=q[i+1][1] if i+1<len(q) else d['marcas'][-1][1]
    L.append(f"file '{n}'\nduration {nt-t:.4f}")
L.append(f"file '{q[-1][0]}'")
open(sys.argv[1]+'/lista.txt','w').write('\n'.join(L))
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',sys.argv[1]+'/lista.txt','-vf','fps=30,scale=1080:1920,format=yuv420p','-c:v','libx264','-crf','18',sys.argv[2]],check=True)

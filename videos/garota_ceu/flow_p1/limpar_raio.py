# fala08: o Flow desenhou raios brancos por cima do rosto em quadros soltos. Esses quadros viram o último quadro bom
# (nenhum cai no trecho em que a mãe fala, 0,75–1,75 s).
import subprocess, sys, numpy as np
src, dst = sys.argv[1], sys.argv[2]; W, H = 720, 1280
raw = subprocess.check_output(["ffmpeg","-v","error","-i",src,"-f","rawvideo","-pix_fmt","rgb24","-"])
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3); n = len(fr)
med = np.median(fr[::4].astype(np.int16), 0)
s = np.array([((f[::2, ::2].astype(np.int16) - med[::2, ::2]).min(2) > 50).sum() for f in fr])
base = np.array([np.median(s[max(0, i - 15):i + 16]) for i in range(n)])
bad = set(np.where(s > base * 1.35 + 150)[0])
bad |= {i + 1 for i in bad if i + 1 < n} | {i - 1 for i in bad if i > 0}   # margem de 1 quadro
print("quadros trocados:", sorted(bad))
out = fr.copy()
for i in range(n):
    if i in bad: out[i] = out[i - 1] if i else fr[0]
p = subprocess.Popen(["ffmpeg","-y","-v","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r","24","-i","-","-i",src,"-map","0:v","-map","1:a","-c:v","libx264","-crf","16","-c:a","copy",dst], stdin=subprocess.PIPE)
p.stdin.write(out.tobytes()); p.stdin.close(); p.wait()

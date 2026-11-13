# Corta um take em parágrafos: usa os N-1 maiores silêncios como cortes. uso: cortar.py take.wav prefixo primeiro_numero N
import subprocess, sys, re
src, pre, n0, N = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
o = subprocess.run(['ffmpeg', '-i', src, '-af', 'silencedetect=n=-38dB:d=0.35', '-f', 'null', '-'], capture_output=True, text=True).stderr
ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', o)]; se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', o)]
dur = float(subprocess.run(['ffprobe', '-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
sil = [(b - a, a, b) for a, b in zip(ss, se) if a > 0.05 and b < dur - 0.05]
cortes = sorted(sorted(sil, reverse=True)[:N - 1], key=lambda x: x[1])
ini = [0.0] + [b - 0.08 for _, a, b in cortes]; fim = [a + 0.12 for _, a, b in cortes] + [dur]
F = 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB'
for k, (a, b) in enumerate(zip(ini, fim)):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src, '-af', F, f'{pre}{n0 + k:02d}.wav'], check=True)
    print(f'{pre}{n0 + k:02d}', round(b - a, 2))

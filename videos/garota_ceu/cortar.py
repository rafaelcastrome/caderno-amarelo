# Corta o take do narrador nos N-1 maiores silêncios (N = parágrafos do narrador.txt) -> audio/N1..wav (atempo 1.1).
# uso: python3 ../cortar.py   (dentro da pasta do episódio)
import re, subprocess
A = "audio/narrador.wav"
N = len([p for p in open("narrador.txt", encoding="utf-8").read().split("\n\n") if p.strip()])
log = subprocess.run(["ffmpeg", "-i", A, "-af", "silencedetect=n=-45dB:d=0.35", "-f", "null", "-"], capture_output=True, text=True).stderr
ss = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]; se = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", A]))
sil = [(s, e) for s, e in zip(ss, se) if s > 0.3 and e < dur - 0.05]
cortes = sorted(sorted(sil, key=lambda x: x[1] - x[0], reverse=True)[:N - 1])
assert len(cortes) == N - 1, (len(cortes), N)
ini = [0.0] + [e for s, e in cortes]; fim = [s for s, e in cortes] + [dur]
for k, (a, b) in enumerate(zip(ini, fim), 1):
    a = max(0, a - 0.08); b = min(dur, b + 0.12)
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", A, "-af", "atempo=1.1,areverse,afade=t=in:d=0.04,areverse", "-ar", "44100", f"audio/N{k}.wav"])
    print(f"N{k}", round((b - a) / 1.1, 2), "pausa antes", round(cortes[k - 2][1] - cortes[k - 2][0], 2) if k > 1 else "")

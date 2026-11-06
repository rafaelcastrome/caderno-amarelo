# Corta o take do narrador nos silêncios -> audio/N1..N16.wav (atempo 1.1, fade curto no fim)
import re, subprocess
A = "audio/narrador.wav"
log = subprocess.run(["ffmpeg", "-i", A, "-af", "silencedetect=n=-45dB:d=0.6", "-f", "null", "-"], capture_output=True, text=True).stderr
ss = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]; se = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", A]))
JUNTA = {15}  # o silêncio 15 (depois de "daí?") fica dentro da fala 16
cortes = [(s, e) for i, (s, e) in enumerate(zip(ss, se)) if i not in JUNTA]
ini = [0.0] + [e for s, e in cortes]; fim = [s for s, e in cortes] + [dur]
for k, (a, b) in enumerate(zip(ini, fim), 1):
    a = max(0, a - 0.08); b = min(dur, b + 0.12)
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", A, "-af", "atempo=1.1,areverse,afade=t=in:d=0.04,areverse", "-ar", "44100", f"audio/N{k}.wav"])
    print(f"N{k}", round((b - a) / 1.1, 2))

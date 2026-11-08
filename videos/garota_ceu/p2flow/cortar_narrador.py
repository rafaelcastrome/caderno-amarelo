# corta o narrador (2 takes Gemini) em N1..N11, encurta pausas internas longas (máx 0,4 s) e acelera 1,1x
import subprocess, wave, numpy as np
CORTES = [("a", 0.3, 11.34), ("a", 13.17, 19.96), ("a", 21.9, 31.82), ("a", 34.12, 37.70), ("a", 39.69, 41.12), ("a", 42.87, 47.0),
          ("b", 0.3, 5.55), ("b", 7.02, 16.12), ("b", 18.47, 24.67), ("b", 26.06, 31.15), ("b", 33.19, 41.16)]
def ler(f):
    w = wave.open(f); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32); return x, w.getframerate()
for i, (t, a, b) in enumerate(CORTES, 1):
    x, sr = ler(f"audio/narrador_{t}.wav"); y = x[int(a * sr):int(b * sr)]
    win = int(0.02 * sr); n = len(y) // win; e = np.sqrt((y[:n * win].reshape(n, win) ** 2).mean(1)) + 1e-6
    quiet = 20 * np.log10(e / 32768) < -45; keep = np.ones(n, bool); j = 0
    while j < n:
        if quiet[j]:
            k = j
            while k < n and quiet[k]: k += 1
            if k - j > 20 and j > 0 and k < n: keep[j + 10:k - 10] = False   # pausa > 0,4 s vira 0,4 s
            j = k
        else: j += 1
    z = np.concatenate([y[m * win:(m + 1) * win] for m in range(n) if keep[m]]).astype(np.int16)
    tmp = f"audio/_n.wav"; w = wave.open(tmp, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(z.tobytes()); w.close()
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", tmp, "-af", "atempo=1.1,afade=t=in:d=0.03,areverse,afade=t=in:d=0.05,areverse", f"audio/N{i}.wav"])
    print(f"N{i}", round(len(z) / sr / 1.1, 2))

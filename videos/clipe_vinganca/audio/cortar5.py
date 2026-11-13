# corta take5.wav (regravação mais limpa do começo) e encurta pausas internas > 0.45 s
import wave, numpy as np
w = wave.open('take5.wav'); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
CORTES = [("N0", 0.2, 3.85)]
h = int(0.02 * sr)
for n, a, b in CORTES:
    y = x[int(a * sr):int(b * sr)]
    r = np.array([np.sqrt(np.mean(y[i:i + h] ** 2)) for i in range(0, len(y) - h, h)]); fala = r > 0.006
    idx = np.where(fala)[0]; i0, i1 = max(0, idx[0] - 3), min(len(r), idx[-1] + 6)
    out = []; i = i0
    while i < i1:
        if not fala[i]:
            j = i
            while j < i1 and not fala[j]: j += 1
            keep = min(j - i, int(0.45 / 0.02)); seg = y[i * h:(i + keep) * h]
            out.append(seg); i = j
        else:
            out.append(y[i * h:(i + 1) * h]); i += 1
    z = np.concatenate(out); f = int(0.01 * sr); z[:f] *= np.linspace(0, 1, f); z[-f:] *= np.linspace(1, 0, f)
    o = wave.open(f'{n}.wav', 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((z * 32767).astype(np.int16).tobytes()); o.close()
    print(n, round(len(z) / sr, 2))

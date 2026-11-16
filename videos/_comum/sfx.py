"""Sons tonais simples (sem ruído branco) para os desafios."""
import numpy as np
SR = 44100
def novo(tot): return np.zeros(int(tot * SR) + SR, np.float32)
def put(x, t0, s):
    i = int(t0 * SR); n = min(len(s), len(x) - i)
    if n > 0: x[i:i + n] += s[:n]
def tom(f, d, amp, dec, f1=None):
    tt = np.arange(int(d * SR)) / SR
    fr = f if f1 is None else np.linspace(f, f1, len(tt))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = amp * np.sin(ph) * np.exp(-tt * dec)
    n = int(0.004 * SR); s[:n] *= np.linspace(0, 1, n)
    return s.astype(np.float32)
def tique(x, t, amp=0.07): put(x, t, tom(1500, 0.06, amp, 60))
def ding(x, t, amp=0.10):  # acerto: duas notas subindo
    put(x, t, tom(1047, 0.5, amp, 7)); put(x, t + 0.09, tom(1568, 0.6, amp, 6))
def buzina(x, t, amp=0.09):  # erro: grave descendo, tonal (onda suavizada)
    tt = np.arange(int(0.42 * SR)) / SR; fr = np.linspace(220, 150, len(tt))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = amp * (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * np.minimum(1, (0.42 - tt) * 12)
    n = int(0.006 * SR); s[:n] *= np.linspace(0, 1, n); put(x, t, s.astype(np.float32))
def bumbo(x, t, amp=0.35): put(x, t, tom(70, 0.5, amp, 6))
def rufar(x, a, b):
    t = a; k = 0
    while t < b - 0.05:
        put(x, t, tom(120, 0.3, 0.10 + 0.08 * (t - a) / max(0.01, b - a), 25)); k += 1; t += max(0.06, 0.18 - 0.012 * k)

# Som de papel pra uma cena renderizada: um "tac" macio (papelão assentando) em cada instante de saida/cenaNN.json.
# Faz o papel do "som original do clipe do Flow" que vai por baixo da voz (~0.35).
# Uso: python3 sfx_papel.py saida/cena01.json   -> saida/cena01.wav   (depois: juntar no mp4 com ffmpeg, ver SKILL.md)
# Sem chiado: nada de ruído branco longo (o Rafael ouve como "xiado"). Só batidinhas graves e curtas.
import json, sys, wave
import numpy as np

SR = 44100

def tac(rng, forte=1.0):
    n = int(SR * 0.09)
    t = np.arange(n) / SR
    corpo = np.sin(2 * np.pi * rng.uniform(140, 210) * t) * np.exp(-t * 55)          # batida grave do papelão
    ruido = rng.standard_normal(n)
    k = np.ones(12) / 12; ruido = np.convolve(ruido, k, mode="same")                  # passa-baixa: tira o chiado
    estalo = ruido * np.exp(-t * 140) * 0.6                                          # o "tec" do papel
    return (corpo * 0.7 + estalo) * forte

def gera(js, out):
    d = json.load(open(js))
    total = int(SR * d["dur"]) + SR
    buf = np.zeros(total)
    rng = np.random.default_rng(7)
    for e in d["eventos"]:
        i = int(e * SR); s = tac(rng, rng.uniform(0.5, 1.0))
        buf[i:i + len(s)] += s[: max(0, total - i)]
    buf = buf[: int(SR * d["dur"])]
    pico = np.abs(buf).max() or 1
    buf = (buf / pico * 0.5 * 32767).astype(np.int16)
    with wave.open(out, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(buf.tobytes())

if __name__ == "__main__":
    for js in sys.argv[1:]:
        gera(js, js.replace(".json", ".wav"))
        print("ok", js.replace(".json", ".wav"))

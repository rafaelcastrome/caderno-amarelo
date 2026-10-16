"""Tomadas do Chatterbox pt-BR (ResembleAI/Chatterbox-Multilingual-pt-br), uma por semente, na GPU se houver."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import AMOSTRAS, N_TOMADAS, TOMADAS, falas_do_motor
sys.path.insert(0, os.path.join(AMOSTRAS, "_space"))
import soundfile as sf
import torch
from chatterbox.src.chatterbox.tts import ChatterboxTTS

dev = "cuda" if torch.cuda.is_available() else "cpu"
m = ChatterboxTTS.from_local(os.path.join(AMOSTRAS, "_models", "chatterbox_ptbr"), dev)
os.makedirs(TOMADAS, exist_ok=True)
for c, voz in falas_do_motor("chatterbox"):
    for n in range(1, N_TOMADAS + 1):
        torch.manual_seed(n)
        t0 = time.time()
        wav = m.generate(c["fala"], exaggeration=voz.get("exaggeration", 0.5), cfg_weight=0.5, language_id="pt")
        sf.write(os.path.join(TOMADAS, f"{c['id']}_t{n}.wav"), wav.squeeze(0).numpy(), m.sr)
        print(f"{c['id']} t{n}: {time.time() - t0:.0f} s", flush=True)

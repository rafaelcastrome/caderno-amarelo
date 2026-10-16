"""Tomadas do Qwen3-TTS 0.6B CustomVoice. Na GTX 1650 precisa de fp32 (em fp16 a amostragem dá NaN)."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import AMOSTRAS, N_TOMADAS, TOMADAS, falas_do_motor
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

dev = "cuda:0" if torch.cuda.is_available() else "cpu"
m = Qwen3TTSModel.from_pretrained(os.path.join(AMOSTRAS, "_models", "Qwen3-TTS-12Hz-0.6B-CustomVoice"),
                                  device_map=dev, dtype=torch.float32, attn_implementation="sdpa")
os.makedirs(TOMADAS, exist_ok=True)
for c, voz in falas_do_motor("qwen"):
    for n in range(1, N_TOMADAS + 1):
        torch.manual_seed(n)
        t0 = time.time()
        wavs, sr = m.generate_custom_voice(text=c["fala"], language="Portuguese", speaker=voz["voz"])
        sf.write(os.path.join(TOMADAS, f"{c['id']}_t{n}.wav"), wavs[0], sr)
        print(f"{c['id']} t{n}: {time.time() - t0:.0f} s", flush=True)

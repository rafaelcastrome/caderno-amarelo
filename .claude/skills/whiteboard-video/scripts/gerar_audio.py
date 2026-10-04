#!/usr/bin/env python3
"""Gera a narração de cada cena do projeto whiteboard.

    python3 gerar_audio.py <pasta-do-projeto>

Lê <projeto>/projeto.json ("cenas": [{"fala": ..., "pausa": ...}], "voz": {...}),
gera audio/cenaN.mp3, mede cada um com ffprobe, concatena tudo em narration.mp3
(volume normalizado) e grava o início/fim de cada cena em timeline.json.

Motores de voz, nesta ordem (usa o primeiro que funcionar em TODAS as cenas):
  1. edge-tts      (voz neural da Microsoft, ex.: pt-BR-AntonioNeural; precisa de speech.platform.bing.com)
  2. Kokoro        (neural, offline, voz brasileira pm_alex/pf_dora; modelo baixado do GitHub, ~350 MB)
  3. eSpeak+MBROLA (sintética, último recurso)
Force um motor com --motor edge|kokoro|espeak.
"""
import argparse
import asyncio
import json
import os
import re
import subprocess

CA_BUNDLES = ["/root/.ccr/ca-bundle.crt"]   # proxies que reassinam TLS (ambiente cloud do Claude Code)
CACHE = os.path.expanduser(os.environ.get("WHITEBOARD_CACHE", "~/.cache/whiteboard-video"))
KOKORO_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
KOKORO_FILES = ["kokoro-v1.0.onnx", "voices-v1.0.bin"]


def duracao(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "default=noprint_wrappers=1:nokey=1", path])
    return float(out.strip())


def para_mp3(wav, mp3):
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", wav, "-b:a", "192k", mp3])
    os.remove(wav)


class Edge:
    nome = "edge-tts"

    def __init__(self, voz):
        import edge_tts
        import edge_tts.communicate as communicate
        for ca in CA_BUNDLES:
            if os.path.exists(ca):
                communicate._SSL_CTX.load_verify_locations(cafile=ca)
        self.edge_tts, self.voz, self.rate = edge_tts, voz.get("edge", "pt-BR-AntonioNeural"), voz.get("edgeRate", "+10%")
        self.nome = f"edge-tts ({self.voz})"

    def gerar(self, texto, mp3):
        asyncio.run(self.edge_tts.Communicate(texto, self.voz, rate=self.rate).save(mp3))


class Kokoro:
    def __init__(self, voz):
        from kokoro_onnx import Kokoro as K
        import soundfile
        d = os.path.join(CACHE, "kokoro")
        os.makedirs(d, exist_ok=True)
        for nome in KOKORO_FILES:
            destino = os.path.join(d, nome)
            if not os.path.exists(destino):
                print(f"Baixando {nome} (uma vez só)...")
                subprocess.check_call(["curl", "-sS", "-L", "--fail", "-o", destino + ".part", KOKORO_URL + nome])
                os.rename(destino + ".part", destino)
        self.k = K(*(os.path.join(d, n) for n in KOKORO_FILES))
        self.sf = soundfile
        self.voz, self.speed = voz.get("kokoro", "pm_alex"), voz.get("kokoroSpeed", 1.1)
        self.nome = f"kokoro ({self.voz}, pt-BR)"

    def gerar(self, texto, mp3):
        fonemas = self.k.tokenizer.phonemize(texto, "pt-br")
        # O eSpeak insere uma vogal de apoio entre "r" e consoante ("tur-ə-no"); no pt-BR falado ela não existe.
        fonemas = re.sub(r"ɾə(?=[^\sˈˌaeiouɐɛɔæʊɪ])", "ɾ", fonemas)
        audio, sr = self.k.create(fonemas, voice=self.voz, speed=self.speed, lang="pt-br", is_phonemes=True)
        wav = mp3[:-4] + "_k.wav"
        self.sf.write(wav, audio, sr)
        para_mp3(wav, mp3)


class Espeak:
    nome = "espeak-ng (mb-br3)"

    def __init__(self, voz):
        subprocess.check_call(["espeak-ng", "--version"], stdout=subprocess.DEVNULL)

    def gerar(self, texto, mp3):
        wav = mp3[:-4] + "_e.wav"
        subprocess.check_call(["espeak-ng", "-v", "mb-br3", "-s", "165", "-w", wav, texto], stderr=subprocess.DEVNULL)
        para_mp3(wav, mp3)


MOTORES = {"edge": Edge, "kokoro": Kokoro, "espeak": Espeak}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto", nargs="?", default=".")
    ap.add_argument("--motor", choices=list(MOTORES))
    a = ap.parse_args()
    root = os.path.abspath(a.projeto)
    proj = json.load(open(os.path.join(root, "projeto.json"), encoding="utf-8"))
    cenas = proj["cenas"]
    voz = proj.get("voz", {})
    audio_dir = os.path.join(root, "audio")
    os.makedirs(audio_dir, exist_ok=True)

    usado = None
    for chave in ([a.motor] if a.motor else ["edge", "kokoro", "espeak"]):
        try:
            motor = MOTORES[chave](voz)
            for i, c in enumerate(cenas, 1):
                motor.gerar(c["fala"], os.path.join(audio_dir, f"cena{i}.mp3"))
            usado = motor.nome
            break
        except Exception as e:  # noqa: BLE001
            print(f"[aviso] {MOTORES[chave].__name__} falhou ({type(e).__name__}: {str(e)[:160]}); tentando o próximo.")
    if not usado:
        raise SystemExit("Nenhum motor de voz funcionou.")

    lista, tempos, t = [], [], 0.0
    for i, c in enumerate(cenas, 1):
        mp3 = os.path.join(audio_dir, f"cena{i}.mp3")
        wav = os.path.join(audio_dir, f"cena{i}.wav")
        fala = duracao(mp3)
        pausa = c.get("pausa", 2.5 if i == len(cenas) else proj.get("pausaPadrao", 0.6))
        subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", mp3, "-ar", "44100", "-ac", "2",
                               "-af", f"apad=pad_dur={pausa}", wav])
        d = duracao(wav)
        tempos.append({"cena": i, "start": round(t, 3), "end": round(t + d, 3), "fala": round(fala, 3)})
        t += d
        lista.append(f"file '{wav}'")
    lista_path = os.path.join(audio_dir, "lista.txt")
    with open(lista_path, "w") as f:
        f.write("\n".join(lista) + "\n")
    narr = os.path.join(root, "narration.mp3")
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lista_path,
                           "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100",
                           "-c:a", "libmp3lame", "-b:a", "192k", narr])
    for i in range(1, len(cenas) + 1):
        os.remove(os.path.join(audio_dir, f"cena{i}.wav"))
    os.remove(lista_path)

    total = duracao(narr)
    with open(os.path.join(root, "timeline.json"), "w", encoding="utf-8") as f:
        json.dump({"total": round(total, 3), "motor_tts": usado, "cenas": tempos}, f, ensure_ascii=False, indent=2)
    for c in tempos:
        print(f"Cena {c['cena']}: {c['start']:.2f}s -> {c['end']:.2f}s (fala {c['fala']:.2f}s)")
    print(f"Total: {total:.2f}s  (voz: {usado})")


if __name__ == "__main__":
    main()

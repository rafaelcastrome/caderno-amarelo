#!/usr/bin/env python3
"""Uma requisição Gemini TTS multi-locutor (2 vozes) -> take.wav (24 kHz mono).
uso: gemini_dialogo2.py roteiro.txt saida.wav --vozes Filho=Algieba Mae=Kore [--estilo "..."]
roteiro.txt: uma fala por linha no formato "Nome: texto". Lê GEMINI_API_KEY. Gasta 1 requisição."""
import argparse, base64, json, os, sys, urllib.request, wave
ap = argparse.ArgumentParser()
ap.add_argument("roteiro"); ap.add_argument("saida")
ap.add_argument("--vozes", nargs="+", required=True)
ap.add_argument("--estilo", default="")
ap.add_argument("--modelo", default="gemini-3.1-flash-tts-preview")
a = ap.parse_args()
linhas = [l.strip() for l in open(a.roteiro, encoding="utf-8") if l.strip()]
texto = (a.estilo + "\n\n" if a.estilo else "") + "\n".join(linhas)
spk = [{"speaker": v.split("=")[0], "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": v.split("=")[1]}}} for v in a.vozes]
body = {"contents": [{"parts": [{"text": texto}]}],
        "generationConfig": {"responseModalities": ["AUDIO"],
                             "speechConfig": {"multiSpeakerVoiceConfig": {"speakerVoiceConfigs": spk}}}}
key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
req = urllib.request.Request(
    f"https://generativelanguage.googleapis.com/v1beta/models/{a.modelo}:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
try:
    r = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e:
    sys.exit(f"HTTP {e.code}: {e.read().decode()[:600]}")
pcm = base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
with wave.open(a.saida, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
print(a.saida, len(pcm) / 48000, "s")

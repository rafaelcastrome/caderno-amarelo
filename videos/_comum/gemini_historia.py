#!/usr/bin/env python3
"""Uma requisição Gemini TTS com todas as falas (parágrafos) -> take.wav (24 kHz mono).
uso: gemini_take.py falas.txt saida.wav [--voz Algieba] [--modelo gemini-3.1-flash-tts-preview]
Lê GEMINI_API_KEY. Gasta 1 requisição da cota diária do modelo."""
import argparse, base64, json, os, sys, urllib.request, wave

ap = argparse.ArgumentParser()
ap.add_argument("falas"); ap.add_argument("saida")
ap.add_argument("--voz", default="Algieba")
ap.add_argument("--modelo", default="gemini-3.1-flash-tts-preview")
a = ap.parse_args()
paras = [p.strip() for p in open(a.falas, encoding="utf-8").read().split("\n\n") if p.strip()]
texto = ("Narre em português do Brasil, como um contador de histórias carismático e misterioso, "
         "com tom de suspense nas reticências e ritmo natural. Faça uma pausa de um segundo entre cada parágrafo:\n\n"
         + "\n\n".join(paras))
key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
body = {"contents": [{"parts": [{"text": texto}]}],
        "generationConfig": {"responseModalities": ["AUDIO"],
                             "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": a.voz}}}}}
req = urllib.request.Request(
    f"https://generativelanguage.googleapis.com/v1beta/models/{a.modelo}:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
try:
    r = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e:
    sys.exit(f"HTTP {e.code}: {e.read().decode()[:600]}")
c = r["candidates"][0]
if "content" not in c: sys.exit("sem audio: " + json.dumps(c)[:400])
pcm = base64.b64decode(c["content"]["parts"][0]["inlineData"]["data"])
with wave.open(a.saida, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
print(a.saida, len(pcm) / 48000, "s")

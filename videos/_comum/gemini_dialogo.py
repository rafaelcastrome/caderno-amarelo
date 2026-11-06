#!/usr/bin/env python3
"""Uma requisição Gemini TTS multi-voz (2 personagens) -> take.wav (24 kHz mono).
uso: gemini_dialogo.py dialogo.txt saida.wav "Nome1=Voz1" "Nome2=Voz2" [--dir "instrução de atuação"]
Linhas do arquivo: 'Nome: fala', separadas por linha em branco. Lê GEMINI_API_KEY."""
import argparse, base64, json, os, sys, urllib.request, wave
ap = argparse.ArgumentParser()
ap.add_argument("falas"); ap.add_argument("saida"); ap.add_argument("vozes", nargs=2)
ap.add_argument("--dir", default="Leia esta cena de filme em português do Brasil, atuando de verdade, com emoção natural, como dublagem brasileira. Uma pausa de um segundo entre as falas:")
ap.add_argument("--modelo", default="gemini-3.1-flash-tts-preview")
a = ap.parse_args()
paras = [p.strip() for p in open(a.falas, encoding="utf-8").read().split("\n\n") if p.strip()]
texto = a.dir + "\n\n" + "\n\n".join(paras)
sp = [{"speaker": v.split("=")[0], "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": v.split("=")[1]}}} for v in a.vozes]
body = {"contents": [{"parts": [{"text": texto}]}],
        "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"multiSpeakerVoiceConfig": {"speakerVoiceConfigs": sp}}}}
key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{a.modelo}:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
try: r = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e: sys.exit(f"HTTP {e.code}: {e.read().decode()[:600]}")
c = r["candidates"][0]
if "content" not in c: sys.exit("sem audio: " + json.dumps(c)[:400])
pcm = base64.b64decode(c["content"]["parts"][0]["inlineData"]["data"])
with wave.open(a.saida, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
print(a.saida, len(pcm) / 48000, "s")

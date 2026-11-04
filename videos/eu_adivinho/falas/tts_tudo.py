# Uma requisição só pro roteiro inteiro (cota grátis: 10 por dia). Uso: python3 tts_tudo.py Algieba
import json, os, sys, base64, urllib.request, wave
voz = sys.argv[1]; aqui = os.path.dirname(os.path.abspath(__file__))
L = [l.strip() for l in open(os.path.join(aqui, "linhas.txt"), encoding="utf-8") if l.strip()]
P = ("Leia em português do Brasil, com sotaque brasileiro, como um apresentador carismático de vídeo curto falando com um amigo: "
     "natural, animado, misterioso nas reticências e com energia nas exclamações. Faça uma pausa de um segundo entre cada parágrafo:\n\n")
body = {"contents": [{"parts": [{"text": P + "\n\n".join(L)}]}], "generationConfig": {"responseModalities": ["AUDIO"],
        "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voz}}}}}
r = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent",
    data=json.dumps(body).encode(), headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"], "Content-Type": "application/json"})
d = json.load(urllib.request.urlopen(r, timeout=600))
pcm = base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
w = wave.open(os.path.join(aqui, f"{voz}_tudo.wav"), "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm); w.close()
print(round(len(pcm) / 48000, 2), "s")

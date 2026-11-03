import base64, json, os, sys, urllib.request, wave
FALA = "Pera aí! Custo maior por hora não vira preço mais alto do nada, tá? Depende do setor... e de como cada empresa se vira."
v1, v2, modelo, out = sys.argv[1:5]
estilo = ("Leia em português do Brasil, sotaque brasileiro, como um criador de TikTok gravando um áudio de WhatsApp: "
          "animado, natural, ritmo rápido. Os dois falam a mesma frase, um depois do outro, com uma pausa de um segundo entre eles:\n\n")
texto = estilo + f"A: {FALA}\nB: {FALA}"
corpo = {'contents': [{'parts': [{'text': texto}]}],
 'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'multiSpeakerVoiceConfig': {'speakerVoiceConfigs': [
   {'speaker': 'A', 'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': v1}}},
   {'speaker': 'B', 'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': v2}}}]}}}}
req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent',
  data=json.dumps(corpo).encode(), headers={'Content-Type': 'application/json', 'x-goog-api-key': os.environ['GEMINI_API_KEY']})
try:
    with urllib.request.urlopen(req, timeout=300) as r: resp = json.load(r)
except urllib.error.HTTPError as e:
    print('ERRO', e.code, e.read().decode()[:300]); sys.exit(2)
p = resp['candidates'][0]['content']['parts'][0]['inlineData']
pcm = base64.b64decode(p['data'])
with wave.open(out, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
print(out, len(pcm)/48000)

# Gera várias falas num pedido só (economiza cota do Gemini); depois corta nos silêncios.
import json,os,sys,base64,urllib.request,urllib.error,wave
L=[l.strip() for l in open('linhas.txt',encoding='utf-8') if l.strip()]
voz=sys.argv[1]; idx=[int(x) for x in sys.argv[2].split(',')]; out=sys.argv[3]
txt=("Estilo: apresentador de game show brasileiro, empolgado e provocador, muita emoção e energia, suspense nas reticências, animação nas exclamações, ritmo rápido. "
     "Fale apenas as frases numeradas abaixo, em português do Brasil, sem dizer os números, com um silêncio de dois segundos entre uma frase e outra.\n\n"
     + "\n".join(f"{k}. {L[i-1]}" for k,i in enumerate(idx,1)))
body={"contents":[{"parts":[{"text":txt}]}],"generationConfig":{"responseModalities":["AUDIO"],"speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":voz}}}}}
r=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/"+os.environ.get("M","gemini-3.8-flash-tts")+":generateContent",data=json.dumps(body).encode(),headers={"x-goog-api-key":os.environ["GEMINI_API_KEY"],"Content-Type":"application/json"})
try: d=json.load(urllib.request.urlopen(r,timeout=300))
except urllib.error.HTTPError as e: print(e.code,e.read()[:200]); sys.exit(1)
pcm=base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
w=wave.open(out,"wb");w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(pcm);w.close()
print(out,round(len(pcm)/48000,2))

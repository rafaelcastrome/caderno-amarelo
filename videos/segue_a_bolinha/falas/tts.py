import json,os,sys,base64,urllib.request,urllib.error,wave
L=[l.strip() for l in open('linhas.txt',encoding='utf-8') if l.strip()]
voz=sys.argv[1]; idx=[int(x) for x in sys.argv[2].split(',')]
P=os.environ.get("P","Leia em português do Brasil, com muita emoção, como um gênio da lâmpada teatral, carismático e empolgado, com suspense nas reticências e energia nas exclamações:\n\n")
for i in idx:
    body={"contents":[{"parts":[{"text":P+L[i-1]}]}],"generationConfig":{"responseModalities":["AUDIO"],"speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":voz}}}}}
    r=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/"+os.environ.get("M","gemini-3.1-flash-tts-preview")+":generateContent",data=json.dumps(body).encode(),headers={"x-goog-api-key":os.environ["GEMINI_API_KEY"],"Content-Type":"application/json"})
    try: d=json.load(urllib.request.urlopen(r,timeout=300))
    except urllib.error.HTTPError as e: print(i,e.code,e.read()[:200]); break
    c=d["candidates"][0]
    if "content" not in c: print(i,"sem audio",c.get("finishReason")); continue
    pcm=base64.b64decode(c["content"]["parts"][0]["inlineData"]["data"])
    w=wave.open(f"{voz}_{i}.wav","wb");w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(pcm);w.close()
    print(i,round(len(pcm)/48000,2))

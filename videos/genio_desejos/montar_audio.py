# Monta narration.mp3 + timeline.json a partir de audio/cenaN.mp3 já gravados (Antonio, gravado no PC do Rafael).
# Mesma lógica do gerar_audio.py da skill, sem gerar voz.
import json, os, subprocess
root = os.path.dirname(os.path.abspath(__file__))
dur = lambda p: float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
proj = json.load(open(os.path.join(root,"projeto.json"),encoding="utf-8")); cenas = proj["cenas"]
lista, tempos, t = [], [], 0.0
for i, c in enumerate(cenas, 1):
    mp3 = os.path.join(root,"audio",f"cena{i}.mp3"); wav = mp3[:-4]+".wav"
    pausa = c.get("pausa", 2.5 if i == len(cenas) else proj.get("pausaPadrao", 0.6))
    subprocess.check_call(["ffmpeg","-y","-v","error","-i",mp3,"-ar","44100","-ac","2","-af",f"silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.28:stop_threshold=-42dB,atempo={c.get('tempo',1.1)},apad=pad_dur={pausa}",wav])
    d = dur(wav); tempos.append({"cena":i,"start":round(t,3),"end":round(t+d,3),"fala":round(d-pausa,3)}); t += d
    lista.append(f"file '{wav}'")
lp = os.path.join(root,"audio","lista.txt"); open(lp,"w").write("\n".join(lista)+"\n")
narr = os.path.join(root,"narration.mp3")
subprocess.check_call(["ffmpeg","-y","-v","error","-f","concat","-safe","0","-i",lp,"-af","loudnorm=I=-16:TP=-1.5:LRA=11","-ar","44100","-c:a","libmp3lame","-b:a","192k",narr])
for i in range(1,len(cenas)+1): os.remove(os.path.join(root,"audio",f"cena{i}.wav"))
os.remove(lp)
json.dump({"total":round(dur(narr),3),"motor_tts":"Gemini Algieba (ver projeto.json)","cenas":tempos},open(os.path.join(root,"timeline.json"),"w",encoding="utf-8"),ensure_ascii=False,indent=2)
for c in tempos: print(c)
print("total", dur(narr))

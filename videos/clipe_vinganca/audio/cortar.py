# corta take.wav nas falas (tempos conferidos com Whisper)
import subprocess
CORTES = [("C1",0.2,6.6),("C2",6.7,12.1),("C3",12.1,16.0),("E1",16.0,18.05),("C4",18.05,21.2),
          ("E2",21.2,22.65),("C5",22.65,25.75),("C6",25.75,29.2),("C7",29.2,30.49)]
for n,a,b in CORTES:
    subprocess.run(["ffmpeg","-loglevel","error","-y","-i","take.wav","-ss",str(a),"-to",str(b),
      "-af","silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,afade=t=in:d=0.02,areverse,afade=t=in:d=0.01",
      f"{n}.wav"])

#!/bin/bash
# Renderiza a parte 1 em pedaços de 300 quadros, 3 de cada vez (pula pedaços prontos) e junta em video.mp4.
set -e
cd "$(dirname "$0")"
N=$(python3 -c "import json;print(round(json.load(open('dados.json'))['dur']*30))"); P=partes; mkdir -p $P; : > $P/lista.txt
pids=()
for ((i=0; i<N; i+=300)); do
  f=$P/p_$(printf %05d $i).mp4
  if [ -z "$(ffprobe -v 0 -show_entries format=duration -of csv=p=0 $f 2>/dev/null)" ]; then
    node ../../_toon3d/render.js cena.js $f --dados dados.json --de $i --ate $((i+300)) > /dev/null &
    pids+=($!); if [ ${#pids[@]} -ge 3 ]; then wait ${pids[0]}; pids=("${pids[@]:1}"); fi
  fi
  echo "file '$(basename $f)'" >> $P/lista.txt
done
wait
ffmpeg -v error -y -f concat -safe 0 -i $P/lista.txt -c copy video.mp4
echo "pronto video.mp4"

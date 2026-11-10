#!/bin/bash
# Renderiza uma cena em pedaços de 300 quadros (sobrevive a reinício: pula pedaços prontos) e junta.
# Uso: ./render_pedacos.sh cena.js dados.json saida.mp4 total_quadros
set -e
CENA=$1; DADOS=$2; SAIDA=$3; N=$4; P=partes/$(basename $SAIDA .mp4); mkdir -p $P; : > $P/lista.txt
for ((i=0; i<N; i+=300)); do
  f=$P/p_$(printf %05d $i).mp4
  if ! ffprobe -v 0 -show_entries format=duration -of csv=p=0 $f >/dev/null 2>&1 || [ -z "$(ffprobe -v 0 -show_entries format=duration -of csv=p=0 $f)" ]; then
    node ../../_toon3d/render.js $CENA $f --dados $DADOS --de $i --ate $((i+300)) > /dev/null
  fi
  echo "file '$(basename $f)'" >> $P/lista.txt
done
ffmpeg -v error -y -f concat -safe 0 -i $P/lista.txt -c copy $SAIDA
echo "pronto $SAIDA"

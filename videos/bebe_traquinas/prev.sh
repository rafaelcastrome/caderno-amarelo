#!/bin/bash
# prévia: um quadro no meio de cada tomada (ou nos tempos dados) -> prev/grade.jpg
cd "$(dirname "$0")"
T=${@:-$(python3 -c "import json;d=json.load(open('dados.json'));tl=d['tl']+[d['fim']];print(' '.join(str(round((tl[i]+tl[i+1])/2+0.2,2)) for i in range(len(tl)-1)))")}
rm -f prev/p_*.jpg; ./build.sh cena.js prev/p.mp4 --dados dados.json --prev $T

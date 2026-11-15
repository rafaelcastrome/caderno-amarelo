#!/bin/bash
# junta povos.js + cena.js e renderiza (ou prévia): ./build.sh saida.mp4 [args extras do render.js]
cd "$(dirname "$0")"; cat povos.js cena.js > /tmp/claude-0/rios_full.js
node ../_toon3d/render.js /tmp/claude-0/rios_full.js "$@" --dados dados.json

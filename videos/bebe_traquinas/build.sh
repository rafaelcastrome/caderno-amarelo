#!/bin/bash
# ./build.sh cena.js saida.mp4 [args do render.js]  (junta bebe.js + cenario.js + cena)
cd "$(dirname "$0")"; C=$1; shift
cat bebe.js cenario.js "$C" > /tmp/claude-0/bebe_full.js 2>/dev/null || cat bebe.js "$C" > /tmp/claude-0/bebe_full.js
node ../_toon3d/render.js /tmp/claude-0/bebe_full.js "$@"

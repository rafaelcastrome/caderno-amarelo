#!/usr/bin/env bash
# Instala as dependências do pipeline whiteboard (idempotente; rode uma vez por máquina/sessão).
set -u
need() { command -v "$1" >/dev/null 2>&1; }

need ffmpeg && need ffprobe || { echo "Instalando ffmpeg..."; (apt-get install -y ffmpeg >/dev/null 2>&1 || (apt-get update >/dev/null 2>&1 && apt-get install -y ffmpeg >/dev/null 2>&1)); }
need espeak-ng || { echo "Instalando espeak-ng (fonetização pt-BR)..."; (apt-get install -y --no-install-recommends espeak-ng mbrola mbrola-br3 >/dev/null 2>&1 || (apt-get update >/dev/null 2>&1 && apt-get install -y --no-install-recommends espeak-ng mbrola mbrola-br3 >/dev/null 2>&1)); }
python3 -c "import edge_tts, kokoro_onnx, soundfile" 2>/dev/null || { echo "Instalando pacotes Python (edge-tts, kokoro-onnx, soundfile)..."; pip install -q edge-tts kokoro-onnx soundfile 2>&1 | grep -v -i warning; }
node -e "require('playwright')" 2>/dev/null || node -e "require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright')" 2>/dev/null || { echo "Instalando playwright..."; npm i -g playwright >/dev/null 2>&1; [ -n "${PLAYWRIGHT_BROWSERS_PATH:-}" ] || npx playwright install chromium >/dev/null 2>&1; }

echo "--- verificação ---"
for c in ffmpeg ffprobe espeak-ng node python3; do printf "%-10s %s\n" "$c" "$(command -v $c || echo FALTANDO)"; done
python3 -c "import edge_tts, kokoro_onnx, soundfile; print('python ok')" 2>&1 | tail -1

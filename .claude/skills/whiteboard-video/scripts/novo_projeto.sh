#!/usr/bin/env bash
# Cria uma pasta de projeto de vídeo a partir do template da skill.
#   bash novo_projeto.sh <pasta-do-projeto>
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:?uso: novo_projeto.sh <pasta>}"
mkdir -p "$DEST"
for f in "$SKILL"/assets/template/*; do [ -e "$DEST/$(basename "$f")" ] || cp "$f" "$DEST"/; done
cp "$SKILL"/assets/engine.js "$SKILL"/assets/opentype.min.js "$SKILL"/assets/Caveat-Bold.ttf "$DEST"/
printf "frames/\npreview/\naudio/*.wav\n" > "$DEST/.gitignore"
echo "Projeto criado em $DEST (edite projeto.json e cenas.js)"

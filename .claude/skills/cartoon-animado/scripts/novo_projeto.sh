#!/usr/bin/env bash
# Cria uma pasta de projeto de desenho animado a partir do template da skill.
#   bash novo_projeto.sh <pasta-do-projeto>
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:?uso: novo_projeto.sh <pasta>}"
mkdir -p "$DEST"
for f in "$SKILL"/assets/template/*; do [ -e "$DEST/$(basename "$f")" ] || cp "$f" "$DEST"/; done
cp "$SKILL"/assets/engine.js "$SKILL"/assets/VarelaRound-Regular.ttf "$DEST"/
printf "frames/\npreview/\n" > "$DEST/.gitignore"
echo "Projeto criado em $DEST (edite projeto.json, timeline.json e cenas.js)"

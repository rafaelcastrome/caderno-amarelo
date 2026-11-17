#!/usr/bin/env python3
"""Bailarina que gira: monta narração (take único Algieba) + tique de relógio suave nas pausas."""
import json, subprocess, sys
sys.path.insert(0, "../_comum")
CUTS = [6.9, 14.2, 24.3, 34.8, 44.5]
P = [1.4, 1.0, 3.2, 4.2, 0.8, 2.4]
M = {"take": "falas/take1.wav", "voz": "Algieba", "cortes": CUTS, "cenas": [{"fala": i, "pausa": P[i]} for i in range(6)]}
json.dump(M, open("montagem.json", "w"), indent=1)
subprocess.check_call(["python3", "../_comum/montar.py", "."])

import base64, json, os, sys, urllib.request
modelo, prompt, saida = sys.argv[1], sys.argv[2], sys.argv[3]
body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
try: r = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e: sys.exit(f"HTTP {e.code}: {e.read().decode()[:400]}")
for p in r["candidates"][0]["content"]["parts"]:
    if "inlineData" in p: open(saida, "wb").write(base64.b64decode(p["inlineData"]["data"])); print("ok", saida); break
else: print(r)

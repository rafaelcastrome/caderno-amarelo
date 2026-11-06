import sys, glob
from PIL import Image
fs = sys.argv[2:]; out = sys.argv[1]; W, H = 360, 640; n = len(fs); cols = min(n, 4); rows = (n + cols - 1) // cols
c = Image.new('RGB', (W * cols, H * rows))
for i, f in enumerate(fs): c.paste(Image.open(f).resize((W, H)), ((i % cols) * W, (i // cols) * H))
c.save(out)

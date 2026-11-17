import sys
from PIL import Image, ImageDraw
fs=sys.argv[2:]; out=sys.argv[1]
W,H=288,512; n=len(fs); cols=min(5,n)
im=Image.new('RGB',(W*cols,H*((n+cols-1)//cols)),'black')
for i,f in enumerate(fs):
    a=Image.open(f).resize((W,H)); im.paste(a,((i%cols)*W,(i//cols)*H)); ImageDraw.Draw(im).text(((i%cols)*W+5,(i//cols)*H+5),f,fill='red')
im.save(out)

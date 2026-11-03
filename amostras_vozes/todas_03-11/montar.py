import subprocess, os
from PIL import Image, ImageDraw, ImageFont
F='/home/user/caderno-amarelo/videos/arca_de_noe/Caveat-Bold.ttf'
D='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
M=[('pc_edge_antonio.mp3','Antonio','Microsoft (edge) · voz atual dos vídeos','PC do Rafael'),
 ('pc_chatterbox_padrao.mp3','Chatterbox padrão','IA grátis (voz dos animados: Zé)','PC do Rafael'),
 ('pc_qwen06b_uncle_fu.mp3','Qwen Uncle Fu','IA grátis (Seu Cláudio) · sotaque gringo','PC do Rafael'),
 ('pc_qwen06b_ryan.mp3','Qwen Ryan','IA grátis · sotaque gringo','PC do Rafael'),
 ('pc_qwen06b_aiden.mp3','Qwen Aiden','IA grátis · sotaque gringo','PC do Rafael'),
 ('pc_edge_andrew.mp3','Andrew','Microsoft multilíngue (Amarelinho)','PC do Rafael'),
 ('pc_edge_brian.mp3','Brian','Microsoft multilíngue','PC do Rafael'),
 ('pc_edge_remy.mp3','Remy','Microsoft multilíngue','PC do Rafael')]
GM=[('Fenrir','empolgado'),('Orus','firme'),('Enceladus','soprado'),('Iapetus','claro'),('Umbriel','tranquilo'),('Algieba','suave'),('Algenib','rouco'),('Rasalgethi','explicativo'),('Alnilam','firme'),('Schedar','equilibrado'),('Achird','simpático'),('Zubenelgenubi','descontraído'),('Sadachbia','animado'),('Sadaltager','sabido')]
F2=[('pc_edge_francisca.mp3','Francisca','Microsoft (edge)','PC do Rafael'),('pc_edge_thalita.mp3','Thalita','Microsoft multilíngue','PC do Rafael'),('pc_chatterbox_ptbrf2.mp3','Chatterbox feminina','IA grátis','PC do Rafael')]
GF=[('Kore','firme'),('Zephyr','brilhante'),('Leda','jovem'),('Aoede','leve'),('Callirrhoe','tranquila'),('Autonoe','brilhante'),('Despina','suave'),('Erinome','clara'),('Laomedeia','animada'),('Achernar','macia'),('Gacrux','madura'),('Pulcherrima','direta'),('Vindemiatrix','gentil'),('Sulafat','calorosa')]
g=lambda L,s:[(f'gem_{v}.wav',v,f'Gemini · {d}','nuvem (10 por dia grátis)') for v,d in L]
itens=[(*x,'MASCULINAS') for x in M+g(GM,'')]+[(*x,'FEMININAS') for x in F2+g(GF,'')]
os.makedirs('seg',exist_ok=True); os.makedirs('mp3',exist_ok=True)
lista=open('seg/lista.txt','w')
for i,(arq,nome,desc,onde,grupo) in enumerate(itens,1):
    im=Image.new('RGB',(720,1280),'#FFF6C9'); d=ImageDraw.Draw(im)
    for y in range(160,1280,48): d.line([(0,y),(720,y)],fill='#B9D3EE',width=2)
    d.line([(90,0),(90,1280)],fill='#E8A0A0',width=3)
    c=lambda t,f,y,fill: d.text((360,y),t,font=f,fill=fill,anchor='mm')
    c('Prévia das vozes',ImageFont.truetype(F,64),90,'#333')
    c(f'{grupo} · {i} de {len(itens)}',ImageFont.truetype(D,26),250,'#777')
    c(f'{i}',ImageFont.truetype(F,260),520,'#E0A800')
    c(nome,ImageFont.truetype(F,96 if len(nome)<12 else 74),760,'#222')
    c(desc,ImageFont.truetype(D,26 if len(desc)<38 else 21),860,'#444')
    c(f'onde roda: {onde}',ImageFont.truetype(D,24),920,'#777')
    c('"Pera aí! Custo maior por hora não vira',ImageFont.truetype(F,40),1110,'#555')
    c('preço mais alto do nada, tá? ..."',ImageFont.truetype(F,40),1160,'#555')
    im.save(f'seg/{i:02d}.png')
    slug=f"{i:02d}_{nome.replace(' ','_')}"
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',arq,'-af','loudnorm=I=-16:TP=-1.5,apad=pad_dur=0.9','-ar','44100','-ac','1',f'seg/{i:02d}.wav'],check=True)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',arq,'-af','loudnorm=I=-16:TP=-1.5','-ar','44100','-b:a','128k',f'mp3/{slug}.mp3'],check=True)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-loop','1','-framerate','10','-i',f'seg/{i:02d}.png','-i',f'seg/{i:02d}.wav','-shortest','-c:v','libx264','-tune','stillimage','-pix_fmt','yuv420p','-r','10','-c:a','aac','-b:a','96k',f'seg/{i:02d}.mp4'],check=True)
    lista.write(f"file '{i:02d}.mp4'\n")
lista.close()
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i','seg/lista.txt','-c','copy','-movflags','+faststart','previa_todas_as_vozes.mp4'],check=True)

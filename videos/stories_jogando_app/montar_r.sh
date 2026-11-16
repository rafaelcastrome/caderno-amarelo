set -e
D=21.05
ffmpeg -loglevel error -y -i tela_r.mp4 \
 -loop 1 -i marca.png -loop 1 -i t_amigo.png -loop 1 -i t_ranking.png -loop 1 -i t_reposta.png -loop 1 -i final.png -i audio_r.wav -loop 1 -i t_gancho2.png \
 -filter_complex "\
[0:v]trim=start=2.75,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=6,trim=0:$D,setpts=PTS-STARTPTS[b];\
[2:v]format=rgba,fade=in:st=10.6:d=0.2:alpha=1[a1];\
[3:v]format=rgba,fade=in:st=14.55:d=0.2:alpha=1[a2];\
[4:v]format=rgba,fade=in:st=16.85:d=0.2:alpha=1[a3];\
[5:v]format=rgba,fade=in:st=19.25:d=0.3:alpha=1[a4];\
[b][1:v]overlay=x='if(lt(t,2.4),60,if(gte(t,9.35),645,if(lt(mod(t,6),3),60,645)))':y='if(lt(t,2.4),1570,if(lt(t,9.35),1480,if(lt(t,14.5),1700,175)))':enable='lt(t,19.25)':shortest=1[v1];\
[v1][7:v]overlay=x=(W-w)/2:y=1440:enable='lt(t,2.4)':shortest=1[v1b];\
[v1b][a1]overlay=x=(W-w)/2:y=1470:enable='between(t,10.6,14.45)':shortest=1[v2];\
[v2][a2]overlay=x=(W-w)/2:y=1470:enable='between(t,14.55,16.85)':shortest=1[v3];\
[v3][a3]overlay=x=(W-w)/2:y=1470:enable='between(t,16.85,19.25)':shortest=1[v4];\
[v4][a4]overlay=0:0:enable='gte(t,19.25)':shortest=1,format=yuv420p[v]" \
 -map "[v]" -map 6:a -t $D -r 30 -c:v libx264 -preset slow -crf 24 -c:a aac -b:a 128k -movflags +faststart sem_faixa_r.mp4

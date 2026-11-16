set -e
D=49.0
ffmpeg -loglevel error -y -i intro.mp4 -i tela.mp4 \
 -loop 1 -i marca.png -loop 1 -i t_amigo.png -loop 1 -i t_ranking.png -loop 1 -i t_reposta.png -loop 1 -i final.png -i audio.wav -loop 1 -i t_gancho.png \
 -filter_complex "\
[0:v]tpad=start_mode=clone:start_duration=1,trim=0:8.4,setpts=PTS-STARTPTS[i];\
[1:v]tpad=start_mode=clone:start_duration=2:stop_mode=clone:stop_duration=10,setpts=PTS-STARTPTS[g];\
[i][g]concat=n=2:v=1,trim=0:$D,setpts=PTS-STARTPTS[b];\
[8:v]format=rgba,fade=in:st=0.3:d=0.25:alpha=1[a0];\
[3:v]format=rgba,fade=in:st=34.0:d=0.25:alpha=1[a1];\
[4:v]format=rgba,fade=in:st=40.35:d=0.25:alpha=1[a2];\
[5:v]format=rgba,fade=in:st=43.75:d=0.25:alpha=1[a3];\
[6:v]format=rgba,fade=in:st=46.35:d=0.35:alpha=1[a4];\
[b][2:v]overlay=x='if(gte(t,29.8),645,if(lt(mod(t,10),5),60,645))':y='if(lt(t,8.4),1660,if(lt(t,29.8),1480,if(lt(t,38.2),1700,175)))':enable='lt(t,46.35)':shortest=1[v1];\
[v1][a0]overlay=x=(W-w)/2:y=1470:enable='between(t,0.3,8.4)':shortest=1[v1b];\
[v1b][a1]overlay=x=(W-w)/2:y=1470:enable='between(t,34.0,40.2)':shortest=1[v2];\
[v2][a2]overlay=x=(W-w)/2:y=1470:enable='between(t,40.35,43.6)':shortest=1[v3];\
[v3][a3]overlay=x=(W-w)/2:y=1470:enable='between(t,43.75,46.35)':shortest=1[v4];\
[v4][a4]overlay=0:0:enable='gte(t,46.35)':shortest=1,format=yuv420p[v]" \
 -map "[v]" -map 7:a -t $D -r 30 -c:v libx264 -preset slow -crf 26 -c:a aac -b:a 128k -movflags +faststart sem_faixa.mp4

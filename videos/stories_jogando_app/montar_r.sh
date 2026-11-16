set -e
D=20.6
ffmpeg -loglevel error -y -i tela_r.mp4 \
 -loop 1 -i marca.png -loop 1 -i t_amigo.png -loop 1 -i t_ranking.png -loop 1 -i t_reposta.png -loop 1 -i final.png -i audio_r.wav -loop 1 -i t_gancho2.png \
 -filter_complex "\
[0:v]trim=start=2.75,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=6,trim=0:$D,setpts=PTS-STARTPTS[b];\
[2:v]format=rgba,fade=in:st=10.15:d=0.2:alpha=1[a1];\
[3:v]format=rgba,fade=in:st=14.1:d=0.2:alpha=1[a2];\
[4:v]format=rgba,fade=in:st=16.4:d=0.2:alpha=1[a3];\
[5:v]format=rgba,fade=in:st=18.8:d=0.3:alpha=1[a4];\
[b][1:v]overlay=x='if(lt(t,2.4),645,if(gte(t,8.9),645,if(lt(mod(t,6),3),60,645)))':y='if(lt(t,2.4),262,if(lt(t,8.9),1560,if(lt(t,14.05),1700,175)))':enable='lt(t,18.8)':shortest=1[v1];\
[v1][7:v]overlay=x=(W-w)/2:y=1522:enable='lt(t,2.4)':shortest=1[v1b];\
[v1b][a1]overlay=x=(W-w)/2:y=1470:enable='between(t,10.15,14.0)':shortest=1[v2];\
[v2][a2]overlay=x=(W-w)/2:y=1470:enable='between(t,14.1,16.4)':shortest=1[v3];\
[v3][a3]overlay=x=(W-w)/2:y=1470:enable='between(t,16.4,18.8)':shortest=1[v4];\
[v4][a4]overlay=0:0:enable='gte(t,18.8)':shortest=1,format=yuv420p[v]" \
 -map "[v]" -map 6:a -t $D -r 30 -c:v libx264 -preset slow -crf 24 -c:a aac -b:a 128k -movflags +faststart sem_faixa_r.mp4

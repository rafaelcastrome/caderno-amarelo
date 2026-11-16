set -e
D=20.6
ffmpeg -loglevel error -y -i tela_r.mp4 \
 -loop 1 -i marca.png -loop 1 -i r0.png -loop 1 -i r1.png -loop 1 -i r2.png -loop 1 -i r3.png -loop 1 -i r4.png -loop 1 -i r5.png -loop 1 -i r6.png -loop 1 -i final.png -i audio_reels.wav \
 -filter_complex "\
[0:v]trim=start=2.75,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=6,trim=0:$D,setpts=PTS-STARTPTS[b];\
[9:v]format=rgba,fade=in:st=18.8:d=0.3:alpha=1[fim];\
[b][1:v]overlay=x='if(gte(t,8.9),645,if(lt(mod(t,6),3),60,645))':y='if(lt(t,8.9),1560,if(lt(t,14.05),1700,175))':enable='lt(t,18.8)':shortest=1[v0];\
[v0][2:v]overlay=x=(W-w)/2:y=250:enable='lt(t,2.4)':shortest=1[v1];\
[v1][3:v]overlay=x=(W-w)/2:y=300:enable='between(t,2.45,4.6)':shortest=1[v2];\
[v2][4:v]overlay=x=(W-w)/2:y=300:enable='between(t,4.7,8.4)':shortest=1[v3];\
[v3][5:v]overlay=x=(W-w)/2:y=1450:enable='between(t,8.45,10.1)':shortest=1[v4];\
[v4][6:v]overlay=x=(W-w)/2:y=1450:enable='between(t,10.15,14.05)':shortest=1[v5];\
[v5][7:v]overlay=x=(W-w)/2:y=1380:enable='between(t,14.1,16.4)':shortest=1[v6];\
[v6][8:v]overlay=x=(W-w)/2:y=1380:enable='between(t,16.4,18.8)':shortest=1[v7];\
[v7][fim]overlay=0:0:enable='gte(t,18.8)':shortest=1,format=yuv420p[v]" \
 -map "[v]" -map 10:a -t $D -r 30 -c:v libx264 -preset slow -crf 24 -c:a aac -b:a 128k -movflags +faststart sem_faixa_reels.mp4

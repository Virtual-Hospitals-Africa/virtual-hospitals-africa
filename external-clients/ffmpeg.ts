import { ffmpeg } from 'ffmpeg'

let videoRender = ffmpeg({ input: './dev/video0', ffmpegDir: './dev/ffmpeg' })
await videoRender.videoBitrate('1000k').save('./output.mp4')

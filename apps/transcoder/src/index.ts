import redisClient from "./helpers/redis";
import { reEncode } from "./helpers/encoder";
import express from "express"
import { prisma, Status } from "@repo/db"
import dotenv from "dotenv";
import { spawn } from 'child_process';
dotenv.config()

export interface Video {
  title: string;
  name: string;
  originalSize: number;
  link: string;
  classroomId: string;
  isLive: boolean;
  mediaInfo: {
    width: number;
    height: number;
    fps: number;
    hasAudio: boolean
  };
  description: string | null;
  cover: string | null;
  path: string;
}

const app = express()
app.use(express.static("videos"))
app.listen(5000, () => console.log("Videos Hosted on port 5000"))

const VIDEOS_URL = process.env.VIDEOS_URL as string

function getThumbnail(videoName: string): string | void {
  let ls = spawn(`ffmpeg -i ../uploads/${videoName} -vf "select=gte(n\, (striptime(duration)/2)*fps)" -vframes 1 ../uploads/${videoName}/thumbnail/middle_frame.png`)
  ls.stdout.on('data', (data) => {
    return `../uploads/${videoName}/thumbnail/middle_frame.png`
  });
  
  ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
}

async function main() {
  
  while (true) {
    const popJob = await redisClient.BRPOP("upload-re-encode", 0); // 0 = wait forever
    console.log(popJob)

    if (!popJob) continue;

    try {
      const video: Video = JSON.parse(popJob.element);
      await reEncode(video);
      let cover = video.cover || getThumbnail(video.name) || null
      try {
        await prisma.video.update({
          where: {
            name: video.name
          },
          data: {
            status: Status.SUCCESS,
            uploadedAt: new Date(),
            link: `${VIDEOS_URL}/${video.name}`,
            cover
          }
        })
      } catch (error) {
        console.error(`Video ${video.name} status was not updated to database: ` + error);
      }
    } catch (err) {
      console.error("Job failed:", err);
    }
  }
}

main();

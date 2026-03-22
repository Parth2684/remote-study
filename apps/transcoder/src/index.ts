import redisClient from "./helpers/redis";
import { reEncode } from "./helpers/encoder";
import express from "express"

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

async function main() {
  
  while (true) {
    const popJob = await redisClient.BRPOP("upload-re-encode", 0); // 0 = wait forever
    console.log(popJob)

    if (!popJob) continue;

    try {
      const video: Video = JSON.parse(popJob.element);
      await reEncode(video);
    } catch (err) {
      console.error("Job failed:", err);
    }
  }
}

main();

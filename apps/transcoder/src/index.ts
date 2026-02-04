import redisClient from "./helpers/redis";
import z from "zod";
import { prisma } from "@repo/db";
import { reEncode } from "./helpers/encoder";

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
  };
  description: string | null;
  cover: string | null;
  path: string;
}

async function main() {
  while (true) {
    const popJob = await redisClient.BRPOP("upload-re-encode", 0); // 0 = wait forever

    if (!popJob) continue;

    try {
      const video: Video = JSON.parse(popJob.element);
      await reEncode(video);
    } catch (err) {
      console.error("Job failed:", err);
      // optional: push to dead-letter queue
    }
  }
}

main();

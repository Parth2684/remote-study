import redisClient from "./helpers/redis";
import z from "zod";
import { prisma } from "@repo/db";

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
  path: string
} 

async function main() {
  const popJob = await redisClient.BRPOP("upload-re-encode", 1.0);
  if (popJob === null) {
    return
  }
  const video: Video = JSON.parse(popJob.element);
  const dbJob = await prisma.video.findFirst({
    where: {
      name: video.name,
    },
  });
  
  
}

main();

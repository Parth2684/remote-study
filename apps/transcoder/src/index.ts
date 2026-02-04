import redisClient from "./helpers/redis";
import z from "zod";
import { prisma } from "@repo/db";
import { reEncode } from './helpers/encoder';

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
  console.log("pop")
  if (popJob === null) {
    return
  }
  console.log(popJob)
  const video: Video = JSON.parse(popJob.element);
  console.log(popJob.element)
  // const dbJob = await prisma.video.findFirst({
  //   where: {
  //     name: video.name,
  //   },
  // });
  
  // console.log(dbJob)
  
  await reEncode(video)
}

main();

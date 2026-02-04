import redisClient from "./helpers/redis";
import type { Job } from "@repo/db";
import z from "zod";
import { prisma } from "@repo/db";

async function main() {
  const popJob = await redisClient.BRPOP("upload-re-encode");
  const job: Job = JSON.parse(popJob.element);
  const dbJob = prisma.job.findUnique({
    where: {
      id: job.id,
    },
  });
  
  
}

main();

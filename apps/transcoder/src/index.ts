import redisClient from "./helpers/redis";
import { reEncode } from "./helpers/encoder";
import express from "express"
import { prisma, Status } from "@repo/db"
import dotenv from "dotenv";
import { spawn } from 'child_process';
import { getVideoSize } from './helpers/fileSize';
import nodemailer from "nodemailer"
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

function getThumbnail(videoName: string): string | null {
  try {
    spawn(
      `ffmpeg -i ../uploads/${videoName} -vf "thumbnail" -frames:v 1 ../uploads/${videoName}/thumbnail.png`,
      { shell: true }
    );
    return `../uploads/${videoName}/thumbnail.png`;
  } catch {
    return null;
  }
}

async function main() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });
  
  const sendEmail = async (email: string, subject: string, html: string) =>
    transporter.sendMail({
      from: "EduLite",
      to: email,
      subject,
      html,
    });

  
  while (true) {
    const popJob = await redisClient.BRPOP("upload-re-encode", 0); // 0 = wait forever
    console.log(popJob)
    
    let name: string = "";

    if (!popJob) continue;
    const video: Video = JSON.parse(popJob.element);

    try {
      name = video.name;
      await reEncode(video);
      let cover = video.cover || getThumbnail(video.name) || null
      const results = await Promise.allSettled([
        getVideoSize(`${video.name}/v2`),
        getVideoSize(`${video.name}/v1`),
        getVideoSize(`${video.name}/v0`)
      ]);
      
      const [fhdSize, hdSize, sdSize] = results.map(r =>
        r.status === "fulfilled" ? r.value : null
      );
      
      try {
        const dbVideo = await prisma.video.update({
          where: {
            name: video.name
          },
          data: {
            status: Status.SUCCESS,
            uploadedAt: new Date(),
            link: `${VIDEOS_URL}/${video.name}`,
            cover,
            fhdSize,
            hdSize,
            sdSize
          },
          include: {
            classroom: {
              include: {
                instructor: true
              }
            }
          }
        });
        // add this after video watchings is made
        // 
        // <a href="${}" 
        //    style="display:inline-block; margin-top:15px; padding:10px 15px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
        //    Watch Now
        // </a>
        await sendEmail(dbVideo.classroom.instructor.email, "Session Encoding Failure", `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
          <div style="max-width:600px; margin:auto; background:white; border-radius:10px; padding:20px;">
            
            <h2 style="color:#4CAF50; margin-bottom:10px;">✅ Video Ready</h2>
            
            <p style="font-size:16px; color:#333;">
              Your session <strong>${dbVideo.title}</strong> has been successfully processed and is now available.
            </p>
        
        
            <p style="margin-top:20px; font-size:12px; color:#888;">
              — EduLite Team
            </p>
        
          </div>
        </div>
        `)
      }catch (error) {
        console.error(`Video ${video.name} status was not updated to database: ` + error);
      }
      
    } catch (err) {
      console.error("Job failed:", err);
      const video: Video = JSON.parse(popJob.element);
      await prisma.video.update({
        where: {
          name
        },
        data: {
          status: Status.FAIL
        }
      })
      await sendEmail(dbVideo.classroom.instructor.email, "Session Encoding Success", `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; padding:20px;">
          
          <h2 style="color:#E53935;">❌ Processing Failed</h2>
          
          <p style="font-size:16px; color:#333;">
            Unfortunately, your session <strong>${video.title}</strong> could not be processed.
          </p>
      
          <p style="font-size:14px; color:#555;">
            Please try uploading again or contact support if the issue persists.
          </p>
      
          <p style="margin-top:20px; font-size:12px; color:#888;">
            — EduLite Team
          </p>
      
        </div>
      </div>
      `)
    }
  }
}

main();

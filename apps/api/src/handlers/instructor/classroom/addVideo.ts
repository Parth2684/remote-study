import { Request, RequestHandler, Response } from "express";
import { upload } from "../../../middleware/upload";
import { ffprobeVideo } from "../../../utils/getMediaInfo";
import z from "zod";
import { prisma, Video } from "@repo/db";
import redisClient from "../../../utils/redis";
import cloudinary from "../../../utils/cloudinary";
import { convertImageToWebP } from "../../../utils/image";
import { UploadApiResponse } from "cloudinary";

const uploadVideoSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  cover: z.string().optional(), //base64 string from frontend
});

export const uploadVideoHandler: RequestHandler[] = [
  upload.single("video"),

  async (req: Request, res: Response) => {
    const classroomId = req.params.classroomId;
    if (!classroomId) {
      res.status(411).json({
        message: "error parsing classoom id",
      });
      return;
    }

    try {
      const classroom = await prisma.classroom.findUnique({
        where: {
          id: classroomId,
        },
      });
      if (!classroom || classroom.instructorId !== req.user.id) {
        res.status(401).json({
          message: "No such classroom found",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Error fetching classroom",
      });
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const { filename, path, size } = req.file;
    const parsedBody = uploadVideoSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(411).json({
        message: parsedBody.error,
      });
      return;
    }
    let uploadResponse: UploadApiResponse | null = null;
    try {
      const { cover } = parsedBody.data;

      if (cover) {
        const matches = cover.match(/^data:image\/([a-zA-Z0-9.-]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          res.status(400).json({
            msg: "Invalid image format. Please check if the image is properly encoded.",
          });
          return;
        }

        let webpBuffer = await convertImageToWebP(cover);

        const webpBase64 = webpBuffer.toString("base64");

        try {
          uploadResponse = await cloudinary.uploader.upload(
            `data:image/webp;base64,${webpBase64}`,
            {
              folder: "Post_Images",
              transformation: [
                { quality: "auto", fetch_format: "webp" },
                { width: "auto", crop: "limit", max_width: 2000 },
                { dpr: "auto" },
              ],
              resource_type: "image",
            },
          );
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError)
        }
      }
    } catch (err) {
      console.error(err);
    }

    try {
      let mediaInfo = await ffprobeVideo(path);
      try {
        let videoData: {
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
        } = {
          title: parsedBody.data.title,
          name: filename,
          originalSize: size,
          link: "pending",
          classroomId: classroomId,
          isLive: false,
          mediaInfo,
          description: null,
          cover: null
        };
        if (parsedBody.data.description) {
          videoData.description = parsedBody.data.description;
        }
        if (uploadResponse) {
          videoData.cover = uploadResponse.secure_url;
        }
        const video = await prisma.video.create({
          data: videoData,
        });
        try {
          const toPushRedis = {
            ...videoData,
            path
          }
          await redisClient.LPUSH("upload-re-encode", JSON.stringify(toPushRedis));
        }
        catch (err) {
          console.error(err)
          
        }
        
      } catch (e) {
        console.error(e);
        res.status(500).json({
          message: "error creating database entry for the video please try again",
        });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "error getting media information",
      });
      return;
    }

    // await enqueueEncodingJob({
    //   videoId,
    //   inputPath: req.file.path,
    //   originalName: req.file.originalname
    // });

    res.json({
      message: "successfully video added in queue for encoding",
    });
  },
];

import { Request, RequestHandler, Response } from "express";
import { upload } from "../../../middleware/upload";
import { ffprobeVideo } from "../../../utils/getMediaInfo";

export const uploadVideoHandler: RequestHandler[] = [
  upload.single("video"),

  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { filename, path, size } = req.file;

    try {
      let mediaInfo = await ffprobeVideo(path);
      
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
      ok: true,
    });
  },
];

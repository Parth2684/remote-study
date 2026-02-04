import { spawn } from "child_process";

export function ffprobeVideo(file: string): Promise<{
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
}> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "error",
      "-show_entries", "stream=codec_type,width,height,avg_frame_rate",
      "-of", "json",
      file
    ];

    const proc = spawn("ffprobe", args);

    let output = "";
    proc.stdout.on("data", d => (output += d.toString()));
    proc.stderr.on("data", d => console.error(d.toString()));

    proc.on("close", code => {
      if (code !== 0) return reject(new Error("ffprobe failed"));

      const json = JSON.parse(output);
      const streams = json.streams as any[];

      const video = streams.find(s => s.codec_type === "video");
      if (!video) return reject(new Error("No video stream"));

      const hasAudio = streams.some(s => s.codec_type === "audio");

      const [num, den] = (video.avg_frame_rate || "0/1")
        .split("/")
        .map(Number);

      const fps = den ? num / den : 0;

      resolve({
        width: video.width,
        height: video.height,
        fps,
        hasAudio
      });
    });
  });
}



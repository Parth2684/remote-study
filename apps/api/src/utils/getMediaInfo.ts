import { spawn } from "child_process";

export function ffprobeVideo(file: string): Promise<{
  width: number;
  height: number;
  fps: number;
}> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,avg_frame_rate",
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
      const stream = json.streams[0];

      const [num, den] = stream.avg_frame_rate.split("/").map(Number);
      const fps = den ? num / den : 0;

      resolve({
        width: stream.width,
        height: stream.height,
        fps
      });
    });
  });
}

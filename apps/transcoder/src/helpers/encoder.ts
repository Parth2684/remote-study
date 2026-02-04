import type { Job } from "@repo/db";

type Rendition = {
  name: string;
  width: number;
  height: number;
  crf: number;
  audioBitrate: number;
};

const LADDER: Rendition[] = [
  { name: "480", width: 854, height: 480, crf: 34, audioBitrate: 48 },
  { name: "720", width: 1280, height: 720, crf: 32, audioBitrate: 64 },
  { name: "1080", width: 1920, height: 1080, crf: 30, audioBitrate: 80 },
];

async function reEncode(job: Job) {
  let fps: number;
  if (job.fps >= 30) {
    fps = 30;
  } else if (job.fps >= 24 && job.fps < 30) {
    fps = 24;
  } else {
    fps = job.fps;
  }
  const jobOutDir = path.join("videos", job.id);
  fs.mkdirSync(jobOutDir, { recursive: true });

  // ---------- Select valid renditions (NO UPSCALE) ----------
  const renditions = LADDER.filter(
    (r) => r.width <= job.width && r.height <= job.height,
  );

  if (!renditions.length) {
    throw new Error("Video too small for encoding ladder");
  }

  // ---------- Build filter_complex ----------
  const splitLabels = renditions.map((_, i) => `[v${i}]`).join("");
  let filter = `[0:v]fps=${fps},split=${renditions.length}${splitLabels};`;

  renditions.forEach((r, i) => {
    filter += `[v${i}]scale=w=${r.width}:h=-2:force_original_aspect_ratio=decrease[v${i}out];`;
  });

  // ---------- FFmpeg args ----------
  const args: string[] = ["-y", "-i", job.inputPath, "-filter_complex", filter];

  // map video
  renditions.forEach((_, i) => {
    args.push("-map", `[v${i}out]`);
  });

  // map audio once per variant
  renditions.forEach(() => {
    args.push("-map", "0:a:0");
  });

  // ---------- Video codec (VP9 CRF) ----------
  args.push(
    "-c:v",
    "libvpx-vp9",
    "-deadline",
    "good",
    "-cpu-used",
    "2",
    "-row-mt",
    "1",
    "-tile-columns",
    "2",
    "-frame-parallel",
    "1",
  );

  renditions.forEach((r, i) => {
    args.push(`-crf:${i}`, String(r.crf));
    args.push(`-b:v:${i}`, "0");
  });

  // ---------- Audio codec (Opus) ----------
  args.push(
    "-c:a",
    "libopus",
    "-vbr",
    "on",
    "-compression_level",
    "10",
    "-application",
    "voip",
    "-ac",
    "1",
  );

  renditions.forEach((r, i) => {
    args.push(`-b:a:${i}`, `${r.audioBitrate}k`);
  });

  // ---------- HLS ----------
  args.push(
    "-f",
    "hls",
    "-hls_time",
    "4",
    "-hls_playlist_type",
    "vod",
    "-hls_flags",
    "independent_segments",
    "-hls_segment_type",
    "fmp4",

    "-hls_segment_filename",
    path.join(jobOutDir, "v%v", "seg_%03d.m4s"),

    "-master_pl_name",
    "master.m3u8",
    path.join(jobOutDir, "v%v", "stream.m3u8"),
  );

  // ---------- Spawn ----------
  const ffmpeg = spawn("ffmpeg", args, { stdio: "inherit" });

  return new Promise<void>((resolve, reject) => {
    ffmpeg.on("exit", (code) => {
      if (code === 0) {
        resolve(); // ✅ only resolve after FULL encode
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

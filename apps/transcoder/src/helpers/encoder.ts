import path from "path";
import fs from "fs";
import type { Video } from "../index";
import { spawn } from "child_process";

type Rendition = {
  name: string;
  width: number;
  height: number;
  crf: number;
  audioBitrate: number;
};

const LADDER: Rendition[] = [
  { name: "576", width: 1024, height: 576, crf: 34, audioBitrate: 48 },
  { name: "720", width: 1280, height: 720, crf: 32, audioBitrate: 64 },
  { name: "1080", width: 1920, height: 1080, crf: 30, audioBitrate: 80 },
];

export async function reEncode(job: Video) {
  let fps: number;
  if (job.mediaInfo!.fps >= 30) {
    fps = 30;
  } else if (job.mediaInfo.fps >= 24 && job.mediaInfo.fps < 30) {
    fps = 24;
  } else {
    fps = job.mediaInfo.fps;
  }
  const jobOutDir = path.join("videos", job.name);
  fs.mkdirSync(jobOutDir, { recursive: true });

  // ---------- Select valid renditions (NO UPSCALE) ----------
  let renditions = LADDER.filter(
    (r) => r.width <= job.mediaInfo.width && r.height <= job.mediaInfo.height,
  );

  const hasAudio = job.mediaInfo.hasAudio;

  if (!renditions.length) {
    renditions = [
      {
        name: "source",
        width: job.mediaInfo.width,
        height: job.mediaInfo.height,
        crf: 30,
        audioBitrate: 64,
      },
    ];
  }

  // ---------- Build filter_complex ----------
  const splitLabels = renditions.map((_, i) => `[v${i}]`).join("");
  let filter = `[0:v]split=${renditions.length}${splitLabels};`;

  renditions.forEach((r, i) => {
    filter += `[v${i}]scale=w=${r.width}:h=-${r.height}:force_original_aspect_ratio=decrease[v${i}out];`;
  });

  // ---------- FFmpeg args ----------
  const args: string[] = [
    "-y",
    "-fflags",
    "+genpts",
    "-i",
    `../uploads/${job.name}`,
    "-filter_complex",
    filter,
  ];

  args.push("-r", String(fps), "-vsync", "cfr");

  args.push("-g", String(fps * 4), "-keyint_min", String(fps * 4));

  args.push("-af", "aresample=async=1000:first_pts=0");
  args.push("-max_muxing_queue_size", "1024");
  // map video
  renditions.forEach((_, i) => {
    args.push("-map", `[v${i}out]`);
  });

  // map audio once per variant
  if (hasAudio) {
    renditions.forEach(() => {
      args.push("-map", "0:a:0");
    });
  }

  // ---------- Video codec (VP9 CRF) ----------
  args.push(
    "-c:v",
    "libvpx-vp9",
    "-deadline",
    "good",
    "-cpu-used",
    "4",
    "-row-mt",
    "1",
    "-tile-columns",
    "2",
    "-frame-parallel",
    "1",
    "-threads",
    "0",
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
    "2",
  );

  renditions.forEach((r, i) => {
    args.push(`-b:a:${i}`, `${r.audioBitrate}k`);
  });

  // ---------- HLS ----------
  //
  // ---------- Variant stream map (CRITICAL) ----------
  const varStreamMap = renditions
    .map((_, i) => (hasAudio ? `v:${i},a:${i}` : `v:${i}`))
    .join(" ");

  if (hasAudio) {
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
      "2",
    );

    renditions.forEach((r, i) => {
      args.push(`-b:a:${i}`, `${r.audioBitrate}k`);
    });
  }

  // master + variant playlists
  args.push(
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

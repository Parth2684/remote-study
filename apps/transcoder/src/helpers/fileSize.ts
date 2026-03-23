import { exec } from "child_process";
import os from "os";

export function getVideoSize(path: string): Promise<number> {
  const platform = os.platform();

  return new Promise((resolve, reject) => {
    let command;

    if (platform === "win32") {
      command = `powershell -command "(Get-ChildItem -Path './videos/${path}' -Recurse | Measure-Object Length -Sum).Sum"`;
    } else {
      command = `du -sb ./videos/${path}`;
    }

    exec(command, (err, stdout) => {
      if (err) return reject(err);

      let sizeBytes: number;

      if (platform === "win32") {
        sizeBytes = parseInt(stdout.trim(), 10);
      } else {
        sizeBytes = parseInt(stdout.split("\t")[0] as string, 10);
      }

      const sizeMB = Number((sizeBytes / (1024 * 1024)).toFixed(2));
      resolve(sizeMB);
    });
  });
}
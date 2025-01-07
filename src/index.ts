import axios from "axios";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import { audioconcat } from "promise-audioconcat";

// Point fluent-ffmpeg to the FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * Checks if a URL returns a 200 OK status via a HEAD request.
 * If it's 404, we return false. If another error occurs, we throw.
 */
async function urlExists(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    // If it's another type of error (e.g. 500, network error), rethrow
    throw error;
  }
}

/**
 * Downloads a file from `url` and writes it to `outputPath`.
 */
async function downloadFile(url: string, outputPath: string): Promise<void> {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

/**
 * Merges multiple audio files into one.
 */
async function processAndMerge(files: string[], outputFilePath: string) {
  // Now merge only the valid files
  await audioconcat(files, outputFilePath);
}

/**
 * Main script logic:
 * 1. Loop over track numbers (01.mp3, 02.mp3, 03.mp3, etc.).
 * 2. Stop when we receive a 404.
 * 3. Download each valid file.
 * 4. Merge them into a single MP3.
 */
async function main() {
  // Accept a baseUrl as an argument
  // e.g. node src/index.ts https://ipaudio.club/wp-content/uploads/GOLN/Eragon
  const baseUrl = process.argv[2];
  const bookName = process.argv[3] || baseUrl.split("/").pop();
  const downloadDir = "./downloads";

  const outputFilePath = `./audiobooks/${bookName}.mp3`;

  // Create a downloads folder if it doesn't exist
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
  }

  let trackNumber = 1;
  // Continuously try track 01, 02, 03, ... until we get a 404
  const filesToDownload: string[] = [];
  while (true) {
    // Format trackNumber as two digits: 1 -> "01", 2 -> "02", etc.
    const trackString = trackNumber.toString().padStart(2, "0");

    // Example: https://ipaudio.club/wp-content/uploads/GOLN/Eragon/01.mp3?_=1
    const fileUrl = `${baseUrl}/${trackString}.mp3?_=1`;

    // Check if the file exists (via HEAD request)
    const exists = await urlExists(fileUrl);
    if (!exists) {
      console.log(`No file found for track ${trackString}. Stopping.`);
      break;
    }

    filesToDownload.push(fileUrl);
    trackNumber++;
  }

  // If nothing was downloaded, exit
  if (filesToDownload.length === 0) {
    console.log("No audio files found. Exiting.");
    return;
  }

  // Download the files
  const downloadPromises = filesToDownload.map(async (fileUrl, index) => {
    const trackString = (index + 1).toString().padStart(2, "0");
    // Download the file
    const filePath = path.join(downloadDir, `audio_${trackString}.mp3`);
    console.log(`Downloading track ${trackString}...`);
    await downloadFile(fileUrl, filePath);
    return filePath;
  });

  const downloadedFiles = await Promise.all(downloadPromises);

  // Merge the downloaded files
  console.log("Merging audio files...");
  await processAndMerge(downloadedFiles, outputFilePath);

  console.log(`All tracks merged into: ${outputFilePath}`);

  // Clean up downloaded files
  for (const file of downloadedFiles) {
    fs.rmSync(file);
  }
}

// Run the main script
main().catch((error) => {
  console.error("An error occurred:", error);
});

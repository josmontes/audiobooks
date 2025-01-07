# Audio File Downloader and Merger

A Node.js command-line tool that downloads sequential audio files from a URL and merges them into a single audio file.

## Features

- Automatically downloads sequential audio files (01.mp3, 02.mp3, etc.)
- Stops when no more files are found
- Merges all downloaded files into a single MP3
- Handles errors gracefully
- Uses FFmpeg for reliable audio processing

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/thornhill/audiobooks.git
cd audiobooks
```

2. Install dependencies:
```bash
npm install
```
3. Build the project:
```bash
npm run build
```

## Usage

Run the script with a base URL as an argument:
```bash
npm start <base-url> [book-name]
```

### Arguments

- `base-url` (required): The base URL where the audio files are hosted
- `book-name` (optional): Name for the output file. If not provided, it will be extracted from the URL

### Example

```bash
npm start https://ipaudio.club/wp-content/uploads/GOLN/Eragon Eragon
```

This will:
1. Look for files named `01.mp3`, `02.mp3`, etc. at the provided URL
2. Download each file found
3. Merge them into a single file named `My Audiobook.mp3`

### Output

- Downloaded files are temporarily stored in the `./downloads` directory
- The final merged audio file is saved in the `./audiobooks` directory

## Project Structure

```
.
├── src/
│ └── index.ts # Main script
├── downloads/ # Temporary storage for downloaded files
├── audiobooks/ # Output directory for merged files
└── package.json
```

## Error Handling

The script includes error handling for:
- Invalid URLs
- Network errors
- File system errors
- Audio processing errors

## Dependencies

- axios: For downloading files
- fluent-ffmpeg: For audio processing
- @ffmpeg-installer/ffmpeg: FFmpeg binaries
- @ffprobe-installer/ffprobe: FFprobe binaries
- promise-audioconcat: For merging audio files
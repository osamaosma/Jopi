import { spawn } from 'node:child_process';
import { stat } from 'node:fs/promises';

const MAX_SECONDS = 600;

// حد مبدئي مستقل عن مدة الفيديو: 100 ميجابايت.
const MAX_BYTES = 100 * 1024 * 1024;

function run(program, args, {
  timeoutMs = 120000,
  maxOutputBytes = 1024 * 1024,
} = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let bytes = 0;
    let failure = null;

    const stop = error => {
      if (failure) return;
      failure = error;
      child.kill('SIGKILL');
    };

    const timer = setTimeout(() => {
      stop(new Error('VIDEO_PROCESSING_TIMEOUT'));
    }, timeoutMs);

    child.stdout.on('data', chunk => {
      bytes += chunk.length;

      if (bytes > maxOutputBytes) {
        stop(new Error('VIDEO_PROCESSING_OUTPUT_LIMIT'));
        return;
      }

      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      // الاحتفاظ بقدر محدود من سجل الخطأ.
      stderr = (stderr + chunk.toString()).slice(-16000);
    });

    child.on('error', error => {
      clearTimeout(timer);
      reject(error);
    });

    child.on('close', code => {
      clearTimeout(timer);

      if (failure) {
        reject(failure);
      } else if (code !== 0) {
        reject(new Error(
          `VIDEO_PROCESSING_FAILED: ${stderr.slice(-1000)}`
        ));
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function verifyVideo(inputPath, previewPath) {
  const file = await stat(inputPath);

  if (!file.isFile() || file.size <= 0) {
    throw new Error('INVALID_VIDEO_FILE');
  }

  if (file.size > MAX_BYTES) {
    throw new Error('VIDEO_FILE_TOO_LARGE');
  }

  const output = await run('ffprobe', [
    '-v', 'error',
    '-protocol_whitelist', 'file,pipe',
    '-show_entries',
    'format=format_name,duration:stream=codec_type,codec_name,duration',
    '-of', 'json',
    inputPath,
  ]);

  const metadata = JSON.parse(output);
  const streams = Array.isArray(metadata.streams)
    ? metadata.streams
    : [];

  const videoStreams = streams.filter(
    stream => stream.codec_type === 'video'
  );

  const audioStreams = streams.filter(
    stream => stream.codec_type === 'audio'
  );

  const formatName = String(
    metadata.format?.format_name || ''
  );

  if (!formatName.split(',').includes('mp4')) {
    throw new Error('VIDEO_MP4_REQUIRED');
  }

  if (videoStreams.length !== 1 || audioStreams.length > 1) {
    throw new Error('VIDEO_TRACKS_NOT_SUPPORTED');
  }

  // نبدأ بصيغ تشغيل شائعة في المتصفح والهاتف.
  if (videoStreams[0].codec_name !== 'h264') {
    throw new Error('VIDEO_H264_REQUIRED');
  }

  if (
    audioStreams.length &&
    audioStreams[0].codec_name !== 'aac'
  ) {
    throw new Error('VIDEO_AAC_REQUIRED');
  }

  const duration = Number(metadata.format?.duration);

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('INVALID_VIDEO_DURATION');
  }

  if (duration > MAX_SECONDS) {
    throw new Error('VIDEO_EXCEEDS_TEN_MINUTES');
  }

  for (const stream of streams) {
    if (stream.duration == null || stream.duration === 'N/A') {
      continue;
    }

    const streamDuration = Number(stream.duration);

    if (
      !Number.isFinite(streamDuration) ||
      streamDuration > MAX_SECONDS
    ) {
      throw new Error('INVALID_VIDEO_TRACK_DURATION');
    }
  }

  // فحص فك الترميز، وليس الاعتماد على خانة المدة وحدها.
  const progress = await run('ffmpeg', [
    '-nostdin',
    '-v', 'error',
    '-xerror',
    '-threads', '1',
    '-protocol_whitelist', 'file,pipe',
    '-i', inputPath,
    '-map', '0:v:0',
    '-map', '0:a:0?',
    '-t', '601',
    '-progress', 'pipe:1',
    '-nostats',
    '-f', 'null',
    '-',
  ], {
    timeoutMs: 20 * 60 * 1000,
    maxOutputBytes: 4 * 1024 * 1024,
  });

  const decodedTimes = [
    ...progress.matchAll(/^out_time_us=(\d+)$/gm),
  ].map(match => Number(match[1]) / 1000000);

  const decodedDuration = Math.max(0, ...decodedTimes);

  if (
    !Number.isFinite(decodedDuration) ||
    decodedDuration <= 0 ||
    decodedDuration > MAX_SECONDS
  ) {
    throw new Error('VIDEO_EXCEEDS_TEN_MINUTES_OR_INVALID');
  }

  // إنشاء معاينة مطموسة فعلية، لا مجرد طمس في الواجهة.
  await run('ffmpeg', [
    '-nostdin',
    '-v', 'error',
    '-threads', '1',
    '-protocol_whitelist', 'file,pipe',
    '-i', inputPath,
    '-ss', String(Math.min(1, duration / 2)),
    '-map', '0:v:0',
    '-frames:v', '1',
    '-vf',
    'scale=160:160:force_original_aspect_ratio=increase,' +
      'crop=160:160,scale=8:8,scale=160:160,gblur=sigma=10',
    '-update', '1',
    '-y',
    previewPath,
  ]);

  return {
    durationSeconds: Math.max(duration, decodedDuration),
    bytes: file.size,
    videoCodec: 'h264',
    audioCodec: audioStreams.length ? 'aac' : null,
  };
}
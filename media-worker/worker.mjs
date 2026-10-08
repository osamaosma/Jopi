import { createClient } from '@supabase/supabase-js';
import {
  mkdtemp,
  readFile,
  rm,
} from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';

import { verifyVideo } from './verify-video.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('MISSING_WORKER_CONFIGURATION');
}

const BUCKET = 'jopi-paid-chat-photos';
const MAX_BYTES = 100 * 1024 * 1024;
const POLL_INTERVAL_MS = 5000;

const db = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, options = {}) => {
        const timeout = AbortSignal.timeout(60000);

        return fetch(input, {
          ...options,
          signal: options.signal
            ? AbortSignal.any([options.signal, timeout])
            : timeout,
        });
      },
    },
  }
);

let stopping = false;

process.on('SIGTERM', () => {
  stopping = true;
  console.log('Worker shutdown requested.');
});

process.on('SIGINT', () => {
  stopping = true;
  console.log('Worker shutdown requested.');
});

async function rpc(name, params = {}) {
  const { data, error } = await db.rpc(name, params);

  if (error) {
    throw new Error(error.message || 'WORKER_RPC_FAILED');
  }

  return data;
}

function errorCode(error) {
  const message = String(error?.message || '');

  const knownCodes = [
    'INVALID_VIDEO_FILE',
    'VIDEO_FILE_TOO_LARGE',
    'VIDEO_MP4_REQUIRED',
    'VIDEO_TRACKS_NOT_SUPPORTED',
    'VIDEO_H264_REQUIRED',
    'VIDEO_AAC_REQUIRED',
    'INVALID_VIDEO_DURATION',
    'VIDEO_EXCEEDS_TEN_MINUTES',
    'INVALID_VIDEO_TRACK_DURATION',
    'VIDEO_EXCEEDS_TEN_MINUTES_OR_INVALID',
    'VIDEO_PROCESSING_TIMEOUT',
    'VIDEO_PROCESSING_OUTPUT_LIMIT',
    'VIDEO_SOURCE_CHANGED',
    'MEDIA_JOB_LEASE_INVALID',
    'VIDEO_DOWNLOAD_FAILED',
    'VIDEO_PREVIEW_UPLOAD_FAILED',
    'VIDEO_PREVIEW_INVALID',
  ];

  const matched = knownCodes.find(
    code => message === code || message.startsWith(`${code}:`)
  );

  if (matched) return matched;

  if (message.startsWith('VIDEO_PROCESSING_FAILED:')) {
    return 'VIDEO_PROCESSING_FAILED';
  }

  return 'WORKER_OPERATION_FAILED';
}

function isPermanent(code) {
  return new Set([
    'INVALID_VIDEO_FILE',
    'VIDEO_FILE_TOO_LARGE',
    'VIDEO_MP4_REQUIRED',
    'VIDEO_TRACKS_NOT_SUPPORTED',
    'VIDEO_H264_REQUIRED',
    'VIDEO_AAC_REQUIRED',
    'INVALID_VIDEO_DURATION',
    'VIDEO_EXCEEDS_TEN_MINUTES',
    'INVALID_VIDEO_TRACK_DURATION',
    'VIDEO_EXCEEDS_TEN_MINUTES_OR_INVALID',
    'VIDEO_PROCESSING_FAILED',
    'VIDEO_SOURCE_CHANGED',
  ]).has(code);
}

async function downloadOriginal(job, outputPath) {
  const { data, error } = await db.storage
    .from(BUCKET)
    .createSignedUrl(job.original_path, 600);

  if (error || !data?.signedUrl) {
    throw new Error('VIDEO_DOWNLOAD_FAILED');
  }

  const signal = AbortSignal.timeout(5 * 60 * 1000);

  const response = await fetch(data.signedUrl, {
    signal,
    redirect: 'error',
  });

  if (!response.ok || !response.body) {
    await response.body?.cancel();
    throw new Error('VIDEO_DOWNLOAD_FAILED');
  }

  const declaredSize = Number(
    response.headers.get('content-length')
  );

  if (
    Number.isFinite(declaredSize) &&
    declaredSize > MAX_BYTES
  ) {
    await response.body.cancel();
    throw new Error('VIDEO_FILE_TOO_LARGE');
  }

  let downloadedBytes = 0;

  const sizeLimiter = new Transform({
    transform(chunk, encoding, callback) {
      downloadedBytes += chunk.length;

      if (downloadedBytes > MAX_BYTES) {
        callback(new Error('VIDEO_FILE_TOO_LARGE'));
        return;
      }

      callback(null, chunk);
    },
  });

  await pipeline(
    Readable.fromWeb(response.body),
    sizeLimiter,
    createWriteStream(outputPath, { flags: 'wx' }),
    { signal }
  );
}

async function assertLease(job) {
  const { data, error } = await db
    .from('jopi_paid_chat_media_jobs')
    .select('state,lease_id,lease_until')
    .eq('id', job.job_id)
    .single();

  if (error) {
    throw new Error('WORKER_OPERATION_FAILED');
  }

  // ترك وقت كافٍ لرفع المعاينة واعتماد النتيجة.
  if (
    data.state !== 'processing' ||
    data.lease_id !== job.lease_id ||
    Date.parse(data.lease_until) <= Date.now() + 120000
  ) {
    throw new Error('MEDIA_JOB_LEASE_INVALID');
  }
}

async function processJob(job) {
  let directory;

  try {
    if (job.bucket !== BUCKET) {
      throw new Error('WORKER_OPERATION_FAILED');
    }

    directory = await mkdtemp(
      join(tmpdir(), 'jopi-video-')
    );

    const originalPath = join(directory, 'original.mp4');
    const previewPath = join(directory, 'preview.jpg');

    await downloadOriginal(job, originalPath);

    const result = await verifyVideo(
      originalPath,
      previewPath
    );

    const preview = await readFile(previewPath);

    if (!preview.length || preview.length > 1024 * 1024) {
      throw new Error('VIDEO_PREVIEW_INVALID');
    }

    await assertLease(job);

    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(job.preview_path, preview, {
        contentType: 'image/jpeg',
        cacheControl: '0',
        upsert: true,
      });

    if (uploadError) {
      throw new Error('VIDEO_PREVIEW_UPLOAD_FAILED');
    }

    await rpc('jopi_paid_video_complete', {
      p_job_id: job.job_id,
      p_lease_id: job.lease_id,
      p_duration_seconds: result.durationSeconds,
    });

    console.log(JSON.stringify({
      event: 'video_verified',
      job_id: job.job_id,
      duration_seconds: result.durationSeconds,
    }));
  } catch (error) {
    const code = errorCode(error);

    console.error(JSON.stringify({
      event: 'video_processing_failed',
      job_id: job.job_id,
      code,
    }));

    try {
      await rpc('jopi_paid_video_fail', {
        p_job_id: job.job_id,
        p_lease_id: job.lease_id,
        p_error: code,
        p_permanent: isPermanent(code),
      });
    } catch {
      // إذا انقطع الاتصال، تستعاد المهمة بعد انتهاء الحجز.
      console.error(JSON.stringify({
        event: 'job_release_failed',
        job_id: job.job_id,
      }));
    }
  } finally {
    if (directory) {
      await rm(directory, {
        recursive: true,
        force: true,
      }).catch(() => {
        console.error('Temporary file cleanup failed.');
      });
    }
  }
}

async function main() {
  console.log('Jopi media worker started.');

  while (!stopping) {
    try {
      const job = await rpc('jopi_paid_video_claim');

      if (!job) {
        await delay(POLL_INTERVAL_MS);
        continue;
      }

      if (job.skipped) {
        await delay(250);
        continue;
      }

      // معالجة ملف واحد في كل مرة.
      await processJob(job);
    } catch {
      console.error('Could not claim a media job.');
      await delay(POLL_INTERVAL_MS);
    }
  }

  console.log('Jopi media worker stopped.');
}

await main();
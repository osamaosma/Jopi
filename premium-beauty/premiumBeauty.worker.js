let face = null;
let pose = null;
let busy = false;
let initializing = false;

function errorText(error, fallback) {
  return error instanceof Error
    ? error.message
    : fallback;
}

function closeModels() {
  try {
    face?.close();
  } catch {
    // نكمل تنظيف النموذج الآخر.
  }

  try {
    pose?.close();
  } catch {
    // نُصفّر المراجع حتى عند فشل التنظيف.
  }

  face = null;
  pose = null;
}

self.onmessage = event => {
  void handleMessage(event.data);
};

async function handleMessage(message) {
  if (message.type === 'init') {
    if (initializing || face || pose) return;

    initializing = true;

    try {
      const base = new URL(message.base).href;

      importScripts(
        new URL('vision_bundle.js', base).href
      );

      const vision = self.Vision;

      if (
        !vision?.FilesetResolver ||
        !vision?.FaceLandmarker ||
        !vision?.PoseLandmarker
      ) {
        throw new Error(
          'تعذر تحميل مكتبة MediaPipe المحلية'
        );
      }

      const files =
        await vision.FilesetResolver.forVisionTasks(
          new URL('wasm', base).href
        );

      face =
        await vision.FaceLandmarker.createFromOptions(
          files,
          {
            baseOptions: {
              modelAssetPath: new URL(
                'face_landmarker.task',
                base
              ).href,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6,
          }
        );

      pose =
        await vision.PoseLandmarker.createFromOptions(
          files,
          {
            baseOptions: {
              modelAssetPath: new URL(
                'pose_landmarker_lite.task',
                base
              ).href,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.65,
            minTrackingConfidence: 0.65,
          }
        );

      self.postMessage({ type: 'ready' });
    } catch (error) {
      closeModels();

      self.postMessage({
        type: 'error',
        message: errorText(
          error,
          'تعذر تحميل نماذج التجميل'
        ),
      });
    } finally {
      initializing = false;
    }

    return;
  }

  if (message.type !== 'frame') return;

  if (busy || !face || !pose) {
    message.bitmap.close();
    return;
  }

  busy = true;

  try {
    const faces = face.detectForVideo(
      message.bitmap,
      message.time
    ).faceLandmarks;

    const bodies = message.body
      ? pose.detectForVideo(
          message.bitmap,
          message.time
        ).landmarks
      : [];

    self.postMessage({
      type: 'result',
      time: message.time,
      face: faces[0] || [],
      body: bodies[0] || [],
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: errorText(
        error,
        'تعذر تتبع الفيديو'
      ),
    });
  } finally {
    message.bitmap.close();
    busy = false;
  }
}
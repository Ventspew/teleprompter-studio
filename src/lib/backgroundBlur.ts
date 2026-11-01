import {
  FilesetResolver,
  ImageSegmenter,
  type ImageSegmenterResult,
} from "@mediapipe/tasks-vision";

const WASM_PATH = "/mediapipe/wasm";
const MODEL_PATH = "/models/selfie_segmenter.tflite";

let segmenterPromise: Promise<ImageSegmenter> | null = null;

async function getSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      try {
        return await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_PATH,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      } catch {
        return ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_PATH,
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      }
    })().catch((error) => {
      segmenterPromise = null;
      throw error;
    });
  }
  return segmenterPromise;
}

export type BackgroundBlurController = {
  stream: MediaStream;
  setBlurAmount: (amount: number) => void;
  stop: () => void;
};

function clampBlur(amount: number) {
  return Math.max(4, Math.min(32, amount));
}

/**
 * Creates a processed MediaStream where the background is blurred and the
 * person stays sharp. Audio tracks are copied from the source stream.
 * Runs fully on-device via MediaPipe (no cloud).
 */
export async function createBackgroundBlurStream(
  source: MediaStream,
  initialBlurAmount: number,
): Promise<BackgroundBlurController> {
  const videoTrack = source.getVideoTracks()[0];
  if (!videoTrack) {
    throw new Error("Geen videostream beschikbaar voor achtergrondvervaging.");
  }

  const segmenter = await getSegmenter();

  const video = document.createElement("video");
  video.playsInline = true;
  video.muted = true;
  video.autoplay = true;
  video.srcObject = source;
  await video.play();

  if (video.videoWidth === 0) {
    await new Promise<void>((resolve) => {
      const onReady = () => {
        video.removeEventListener("loadeddata", onReady);
        resolve();
      };
      video.addEventListener("loadeddata", onReady);
    });
  }

  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const outputCtx = output.getContext("2d", { willReadFrequently: false });
  if (!outputCtx) throw new Error("Canvas niet beschikbaar.");

  const blurCanvas = document.createElement("canvas");
  blurCanvas.width = width;
  blurCanvas.height = height;
  const blurCtx = blurCanvas.getContext("2d", { willReadFrequently: false });
  if (!blurCtx) throw new Error("Canvas niet beschikbaar.");

  const person = document.createElement("canvas");
  person.width = width;
  person.height = height;
  const personCtx = person.getContext("2d", { willReadFrequently: true });
  if (!personCtx) throw new Error("Canvas niet beschikbaar.");

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
  if (!maskCtx) throw new Error("Canvas niet beschikbaar.");

  let blurAmount = clampBlur(initialBlurAmount);
  let running = true;
  let rafId = 0;
  let lastTimestamp = -1;

  const fps = Math.min(30, videoTrack.getSettings().frameRate || 30);
  const capture = output.captureStream(fps);
  for (const track of source.getAudioTracks()) {
    capture.addTrack(track);
  }

  const applyPersonMask = (
    maskUint8: Uint8Array,
    mw: number,
    mh: number,
  ) => {
    personCtx.clearRect(0, 0, width, height);
    personCtx.drawImage(video, 0, 0, width, height);

    if (mw === width && mh === height) {
      const personImage = personCtx.getImageData(0, 0, width, height);
      const data = personImage.data;
      for (let i = 0; i < maskUint8.length; i += 1) {
        const v = maskUint8[i];
        data[i * 4 + 3] = v < 20 ? 0 : v > 220 ? 255 : v;
      }
      personCtx.putImageData(personImage, 0, 0);
      return;
    }

    maskCanvas.width = mw;
    maskCanvas.height = mh;
    const maskImage = maskCtx.createImageData(mw, mh);
    for (let i = 0; i < maskUint8.length; i += 1) {
      const o = i * 4;
      const v = maskUint8[i];
      maskImage.data[o] = 255;
      maskImage.data[o + 1] = 255;
      maskImage.data[o + 2] = 255;
      maskImage.data[o + 3] = v;
    }
    maskCtx.putImageData(maskImage, 0, 0);
    personCtx.globalCompositeOperation = "destination-in";
    personCtx.drawImage(maskCanvas, 0, 0, width, height);
    personCtx.globalCompositeOperation = "source-over";
  };

  const drawFrame = () => {
    if (!running) return;

    try {
      const now = performance.now();
      if (now <= lastTimestamp) {
        rafId = requestAnimationFrame(drawFrame);
        return;
      }
      lastTimestamp = now;

      const result: ImageSegmenterResult = segmenter.segmentForVideo(video, now);
      const confidence = result.confidenceMasks?.[0];

      // Blur on a separate canvas so strength updates every frame reliably.
      blurCtx.clearRect(0, 0, width, height);
      blurCtx.filter = `blur(${blurAmount}px)`;
      blurCtx.drawImage(video, 0, 0, width, height);
      blurCtx.filter = "none";

      outputCtx.clearRect(0, 0, width, height);
      outputCtx.drawImage(blurCanvas, 0, 0);

      if (confidence) {
        applyPersonMask(
          confidence.getAsUint8Array(),
          confidence.width,
          confidence.height,
        );
        outputCtx.drawImage(person, 0, 0);
        confidence.close();
      }
    } catch {
      outputCtx.clearRect(0, 0, width, height);
      outputCtx.filter = "none";
      outputCtx.drawImage(video, 0, 0, width, height);
    }

    rafId = requestAnimationFrame(drawFrame);
  };

  rafId = requestAnimationFrame(drawFrame);

  return {
    stream: capture,
    setBlurAmount: (amount: number) => {
      blurAmount = clampBlur(amount);
    },
    stop: () => {
      running = false;
      cancelAnimationFrame(rafId);
      video.pause();
      video.srcObject = null;
      capture.getVideoTracks().forEach((track) => track.stop());
    },
  };
}

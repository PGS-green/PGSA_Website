import { useEffect, useRef, useState } from "react";

/**
 * PLACEHOLDER — this is the reference clip, not a PGSA building.
 *
 * It stands in so the motion can be judged. Replace it with footage or a render
 * flythrough of an actual PGSA project before this goes anywhere near a client.
 * Nothing else in this component needs to change; the capture is resolution- and
 * length-agnostic.
 */
const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_090628_7052d8a6-a094-4341-a4a2-ad58493a67a9.mp4";

/** Frames are downscaled to this width before being cached, to bound memory. */
const MAX_CAPTURE_WIDTH = 960;

/** Ping-pong playback rate once the frames are in hand. */
const PLAYBACK_FPS = 30;

/**
 * Full-bleed hero background that plays the source video through once while
 * caching every frame, then drops the video and boomerangs the cached frames on
 * a canvas — forward to the end, back to the start, forever.
 *
 * Playing the real video on `loop` would hard-cut from last frame to first on
 * every pass. Reversing instead means the motion always eases back through
 * itself, so there is no seam to notice.
 */
export function BoomerangVideoBg() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const [framesReady, setFramesReady] = useState(false);

  // Pass 1 — play once, capturing each frame to an offscreen canvas.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let rafHandle = 0;
    let videoFrameHandle = 0;
    let lastCapturedTime = -1;

    framesRef.current = [];

    const captureFrame = () => {
      if (cancelled) return;

      // A repeated `currentTime` means the same frame is still on screen.
      if (video.videoWidth > 0 && video.currentTime !== lastCapturedTime) {
        lastCapturedTime = video.currentTime;

        const scale = Math.min(1, MAX_CAPTURE_WIDTH / video.videoWidth);
        const frame = document.createElement("canvas");
        frame.width = Math.round(video.videoWidth * scale);
        frame.height = Math.round(video.videoHeight * scale);

        const ctx = frame.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, frame.width, frame.height);
          framesRef.current.push(frame);
        }
      }

      scheduleCapture();
    };

    const scheduleCapture = () => {
      if (cancelled) return;
      // `requestVideoFrameCallback` gives exactly one callback per decoded
      // frame. Firefox lacks it, so fall back to rAF and let the `currentTime`
      // dedupe above drop the repeats that produces.
      if (typeof video.requestVideoFrameCallback === "function") {
        videoFrameHandle = video.requestVideoFrameCallback(captureFrame);
      } else {
        rafHandle = requestAnimationFrame(captureFrame);
      }
    };

    const stopCapture = () => {
      cancelled = true;
      if (videoFrameHandle && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(videoFrameHandle);
      }
      if (rafHandle) cancelAnimationFrame(rafHandle);
    };

    const handleLoadedData = () => {
      void video.play().catch(() => {
        /* Autoplay blocked — the poster frame stays up; nothing else to do. */
      });
      scheduleCapture();
    };

    const handleEnded = () => {
      stopCapture();
      if (framesRef.current.length > 1) setFramesReady(true);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);

    // `loadeddata` may already have fired before this effect attached.
    if (video.readyState >= 2) handleLoadedData();

    return () => {
      stopCapture();
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Pass 2 — boomerang the cached frames on the visible canvas.
  useEffect(() => {
    if (!framesReady) return;

    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || frames.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = frames[0].width;
    canvas.height = frames[0].height;

    let index = 0;
    let direction = 1;

    const interval = window.setInterval(() => {
      ctx.drawImage(frames[index], 0, 0);

      // Turn around *on* the end frames so neither one is drawn twice.
      if (direction === 1 && index === frames.length - 1) direction = -1;
      else if (direction === -1 && index === 0) direction = 1;

      index += direction;
    }, 1000 / PLAYBACK_FPS);

    return () => window.clearInterval(interval);
  }, [framesReady]);

  return (
    <div className="absolute inset-0 z-0">
      <div className="scale-[1.15] origin-top overflow-hidden w-full h-full">
        <video
          className="w-full h-full object-cover object-top"
          crossOrigin="anonymous"
          muted
          playsInline
          preload="auto"
          ref={videoRef}
          src={VIDEO_SRC}
          style={{ display: framesReady ? "none" : "block" }}
        />
        <canvas
          className="w-full h-full object-cover object-top"
          ref={canvasRef}
          style={{ display: framesReady ? "block" : "none" }}
        />
      </div>
    </div>
  );
}

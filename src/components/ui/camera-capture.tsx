"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Check, X, Loader2 } from "lucide-react";

interface CameraCaptureProps {
  /** Which camera to prefer: "user" = selfie cam, "environment" = rear cam. */
  facing: "user" | "environment";
  /** Called with the captured photo as a JPEG File. */
  onCapture: (file: File) => void;
  onClose: () => void;
  /** Filename for the captured image (without extension). */
  filename?: string;
  /** Short instruction shown above the viewfinder, e.g. "Hold your ID next to your face". */
  instruction?: string;
}

type CameraState = "starting" | "live" | "preview" | "denied" | "unavailable";

/**
 * Full-screen camera modal: live viewfinder -> capture to canvas -> confirm.
 * The caller should fall back to a plain file input (with a `capture`
 * attribute for mobile) when this reports "denied"/"unavailable" via onClose.
 */
export function CameraCapture({ facing, onCapture, onClose, filename = "photo", instruction }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("starting");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState("unavailable");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setState("live");
      } catch {
        if (!cancelled) setState("denied");
      }
    }

    void start();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [facing, stopStream]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Mirror selfies so the saved photo matches what the user saw.
    if (facing === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `${filename}.jpg`, { type: "image/jpeg" });
        setPendingFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setState("preview");
        stopStream();
      },
      "image/jpeg",
      0.92
    );
  };

  const retake = () => {
    setPendingFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setState("starting");
    // Restart the stream by re-running the effect via a microtask.
    void navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then(async (stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setState("live");
      })
      .catch(() => setState("denied"));
  };

  const confirm = () => {
    if (pendingFile) onCapture(pendingFile);
    onClose();
  };

  const close = () => {
    stopStream();
    onClose();
  };

  if (state === "denied" || state === "unavailable") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-background p-6 text-center space-y-4">
          <Camera className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            {state === "denied" ? "Camera permission needed" : "Camera not available"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {state === "denied"
              ? "Allow camera access in your browser, or choose a photo from your gallery instead."
              : "Your device has no usable camera here. Choose a photo from your gallery instead."}
          </p>
          <button
            type="button"
            onClick={close}
            className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Choose a photo instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <p className="text-sm text-white/90">{instruction ?? "Position yourself in the frame"}</p>
        <button type="button" onClick={close} aria-label="Close camera" className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {state === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" />
          </div>
        )}

        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-contain ${facing === "user" ? "-scale-x-100" : ""} ${state === "live" ? "" : "hidden"}`}
        />

        {state === "preview" && previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Captured photo preview" className="h-full w-full object-contain" />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex items-center justify-center gap-8 p-6">
        {state === "live" && (
          <button
            type="button"
            onClick={takePhoto}
            aria-label="Take photo"
            className="h-16 w-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-colors"
          />
        )}

        {state === "preview" && (
          <>
            <button
              type="button"
              onClick={retake}
              className="flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-white hover:bg-white/25"
            >
              <RefreshCw className="h-5 w-5" />
              Retake
            </button>
            <button
              type="button"
              onClick={confirm}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-5 w-5" />
              Use this photo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

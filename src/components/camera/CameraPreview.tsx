
import { useEffect, useRef } from "react";

type CameraPreviewProps = {
  stream: MediaStream | null;
  mirrored?: boolean;
  className?: string;
  muted?: boolean;
};

export function CameraPreview({
  stream,
  mirrored = true,
  className = "",
  muted = true,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) {
      void video.play().catch(() => undefined);
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={`h-full w-full object-cover ${mirrored ? "scale-x-[-1]" : ""} ${className}`}
    />
  );
}

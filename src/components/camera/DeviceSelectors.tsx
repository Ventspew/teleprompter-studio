
import type { VideoQuality } from "@/lib/types";

type DeviceSelectorsProps = {
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  videoDeviceId: string;
  audioDeviceId: string;
  videoQuality: VideoQuality;
  disabled?: boolean;
  onVideoChange: (id: string) => void;
  onAudioChange: (id: string) => void;
  onQualityChange: (quality: VideoQuality) => void;
};

function labelFor(device: MediaDeviceInfo, index: number, kind: string) {
  if (device.label) return device.label;
  return `${kind} ${index + 1}`;
}

export function DeviceSelectors({
  videoDevices,
  audioDevices,
  videoDeviceId,
  audioDeviceId,
  videoQuality,
  disabled,
  onVideoChange,
  onAudioChange,
  onQualityChange,
}: DeviceSelectorsProps) {
  return (
    <div className="grid gap-3">
      <label className="grid gap-1.5 text-xs text-zinc-400">
        Camera
        <select
          className="studio-select"
          value={videoDeviceId}
          disabled={disabled}
          onChange={(e) => onVideoChange(e.target.value)}
        >
          <option value="">Automatisch</option>
          {videoDevices.map((device, index) => (
            <option key={device.deviceId} value={device.deviceId}>
              {labelFor(device, index, "Camera")}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-xs text-zinc-400">
        Microfoon
        <select
          className="studio-select"
          value={audioDeviceId}
          disabled={disabled}
          onChange={(e) => onAudioChange(e.target.value)}
        >
          <option value="">Automatisch</option>
          {audioDevices.map((device, index) => (
            <option key={device.deviceId} value={device.deviceId}>
              {labelFor(device, index, "Microfoon")}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-xs text-zinc-400">
        Opnamekwaliteit
        <select
          className="studio-select"
          value={videoQuality}
          disabled={disabled}
          onChange={(e) => onQualityChange(e.target.value as VideoQuality)}
        >
          <option value="auto">Auto (max 1080p)</option>
          <option value="1080p">1080p</option>
          <option value="720p">720p</option>
        </select>
      </label>
    </div>
  );
}

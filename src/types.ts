export interface MediaFormat {
  id: string;
  type: 'video' | 'audio';
  label: string;
  resolution: string;
  format: string;
  quality: string;
  size: string;
  sizeBytes: number;
  hasAudio: boolean;
  codec: string;
  downloadUrl: string;
}

export interface MediaInspectionResult {
  id: string;
  originalUrl: string;
  platform: string;
  platformName: string;
  title: string;
  author: string;
  duration: number;
  durationFormatted: string;
  thumbnailUrl: string;
  description: string;
  formats: MediaFormat[];
  directStreamUrl?: string;
  isDirectFile?: boolean;
}

export interface PlatformInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  supported: boolean;
  sampleUrl?: string;
  sampleTitle?: string;
}

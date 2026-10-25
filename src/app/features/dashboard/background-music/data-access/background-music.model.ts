export interface BackgroundMusicSettings {
  sourceUrl: string;
  fileName: string;
  hasTrack: boolean;
  fileSize: number | null;
  mimeType: string | null;
  enabled: boolean;
  loop: boolean;
  updatedAt: string | null;
}

export interface BackgroundMusicUpdate {
  enabled: boolean;
  loop: boolean;
  audioFile: File | null;
}

export interface VoiceSpeakerCloneFromAssetForm {
  /** Workspace voice reference asset id */
  assetId: string;
  speakerName: string;
  language?: string;
  model?: string;
  previewText?: string;
  metadata?: Record<string, unknown>;
}

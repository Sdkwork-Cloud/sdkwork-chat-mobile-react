import { Directory, Encoding } from '@capacitor/filesystem';

// ============================================
// Camera Types
// ============================================

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  width?: number;
  height?: number;
  source?: 'camera' | 'photos';
}

export interface CameraResult {
  success: boolean;
  uri?: string;
  format?: string;
  base64?: string;
  error?: string;
}

// ============================================
// File System Types
// ============================================

export interface FileSystemOptions {
  directory?: Directory;
  encoding?: Encoding;
  recursive?: boolean;
}

export interface FileResult {
  success: boolean;
  uri?: string;
  data?: string;
  error?: string;
}

export interface FileInfo {
  name: string;
  type: 'file' | 'directory' | 'unknown';
  size: number;
  mtime: number;
  uri: string;
}

export interface DirectoryResult {
  success: boolean;
  files: FileInfo[];
  error?: string;
}

// ============================================
// Share Types
// ============================================

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  files?: string[];
}

export interface ShareResult {
  success: boolean;
  error?: string;
}

// ============================================
// Geolocation Types
// ============================================

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GeolocationResult {
  success: boolean;
  position?: GeolocationCoordinates;
  timestamp?: number;
  error?: string;
}

export interface GeolocationPermissionResult {
  location: boolean;
  coarseLocation: boolean;
}

export type GeolocationWatcher = (result: GeolocationResult) => void;

// ============================================
// User Profile Types
// ============================================

export interface ProfileImageOptions {
  avatar?: boolean;
  cover?: boolean;
}

export interface ProfileImageResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

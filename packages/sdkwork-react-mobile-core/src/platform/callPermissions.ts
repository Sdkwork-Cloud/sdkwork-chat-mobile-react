export type CallMediaPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface CallMediaPermissionRequest {
  requireCamera?: boolean;
  requireMicrophone?: boolean;
}

export interface CallMediaPermissionStatus {
  supported: boolean;
  camera: CallMediaPermissionState;
  microphone: CallMediaPermissionState;
}

export type CallSessionMode = 'video' | 'audio';
export type CallSessionFailureReason =
  | 'unsupported'
  | 'camera_denied'
  | 'camera_unsupported'
  | 'microphone_denied'
  | 'microphone_unsupported';

export interface PrepareCallMediaSessionOptions {
  preferredMode?: CallSessionMode;
  allowAudioFallback?: boolean;
}

export interface CallSessionPreflightResult {
  ready: boolean;
  mode: CallSessionMode;
  fallbackApplied: boolean;
  reason?: CallSessionFailureReason;
  permissions: CallMediaPermissionStatus;
}

interface PrepareCallMediaSessionDependencies {
  requestPermissions?: (request?: CallMediaPermissionRequest) => Promise<CallMediaPermissionStatus>;
}

type MediaPermissionName = 'camera' | 'microphone';

function resolveRequest(request?: CallMediaPermissionRequest): Required<CallMediaPermissionRequest> {
  return {
    requireCamera: request?.requireCamera ?? true,
    requireMicrophone: request?.requireMicrophone ?? true,
  };
}

function resolveUnsupportedStatus(request: Required<CallMediaPermissionRequest>): CallMediaPermissionStatus {
  return {
    supported: !request.requireCamera && !request.requireMicrophone,
    camera: request.requireCamera ? 'unsupported' : 'granted',
    microphone: request.requireMicrophone ? 'unsupported' : 'granted',
  };
}

function normalizePermissionState(value: unknown): CallMediaPermissionState {
  if (value === 'granted') return 'granted';
  if (value === 'denied') return 'denied';
  if (value === 'prompt') return 'prompt';
  return 'unsupported';
}

async function queryMediaPermission(name: MediaPermissionName): Promise<CallMediaPermissionState | null> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return null;
  }

  try {
    const status = await navigator.permissions.query({ name: name as PermissionName });
    return normalizePermissionState(status.state);
  } catch {
    return null;
  }
}

function applyErrorState(
  request: Required<CallMediaPermissionRequest>,
  error: unknown,
): Pick<CallMediaPermissionStatus, 'camera' | 'microphone'> {
  const name = error instanceof Error ? error.name : '';
  const deniedState: CallMediaPermissionState =
    name === 'NotFoundError' || name === 'OverconstrainedError' ? 'unsupported' : 'denied';

  return {
    camera: request.requireCamera ? deniedState : 'granted',
    microphone: request.requireMicrophone ? deniedState : 'granted',
  };
}

export async function inspectCallMediaPermissions(
  request?: CallMediaPermissionRequest,
): Promise<CallMediaPermissionStatus> {
  const normalized = resolveRequest(request);
  if (
    typeof navigator === 'undefined'
    || !navigator.mediaDevices
    || typeof navigator.mediaDevices.getUserMedia !== 'function'
  ) {
    return resolveUnsupportedStatus(normalized);
  }

  const cameraState = normalized.requireCamera ? await queryMediaPermission('camera') : null;
  const microphoneState = normalized.requireMicrophone ? await queryMediaPermission('microphone') : null;

  return {
    supported: true,
    camera: normalized.requireCamera ? cameraState ?? 'prompt' : 'granted',
    microphone: normalized.requireMicrophone ? microphoneState ?? 'prompt' : 'granted',
  };
}

export async function requestCallMediaPermissions(
  request?: CallMediaPermissionRequest,
): Promise<CallMediaPermissionStatus> {
  const normalized = resolveRequest(request);
  const current = await inspectCallMediaPermissions(normalized);

  if (!current.supported) {
    return current;
  }

  if (current.camera === 'granted' && current.microphone === 'granted') {
    return current;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: normalized.requireCamera,
      audio: normalized.requireMicrophone,
    });
    stream.getTracks().forEach((track) => track.stop());

    return {
      supported: true,
      camera: 'granted',
      microphone: 'granted',
    };
  } catch (error) {
    return {
      supported: true,
      ...applyErrorState(normalized, error),
    };
  }
}

function resolveMicrophoneFailureReason(state: CallMediaPermissionState): CallSessionFailureReason {
  return state === 'unsupported' ? 'microphone_unsupported' : 'microphone_denied';
}

function resolveCameraFailureReason(state: CallMediaPermissionState): CallSessionFailureReason {
  return state === 'unsupported' ? 'camera_unsupported' : 'camera_denied';
}

function createPreflightResult(
  mode: CallSessionMode,
  permissions: CallMediaPermissionStatus,
  options?: {
    ready?: boolean;
    fallbackApplied?: boolean;
    reason?: CallSessionFailureReason;
  },
): CallSessionPreflightResult {
  return {
    ready: options?.ready ?? true,
    mode,
    fallbackApplied: options?.fallbackApplied ?? false,
    reason: options?.reason,
    permissions,
  };
}

export async function prepareCallMediaSession(
  options?: PrepareCallMediaSessionOptions,
  dependencies?: PrepareCallMediaSessionDependencies,
): Promise<CallSessionPreflightResult> {
  const preferredMode = options?.preferredMode ?? 'video';
  const allowAudioFallback = options?.allowAudioFallback ?? true;
  const requestPermissions = dependencies?.requestPermissions ?? requestCallMediaPermissions;

  if (preferredMode === 'audio') {
    const audioPermissions = await requestPermissions({
      requireCamera: false,
      requireMicrophone: true,
    });

    if (!audioPermissions.supported) {
      return createPreflightResult('audio', audioPermissions, {
        ready: false,
        reason: 'unsupported',
      });
    }

    if (audioPermissions.microphone !== 'granted') {
      return createPreflightResult('audio', audioPermissions, {
        ready: false,
        reason: resolveMicrophoneFailureReason(audioPermissions.microphone),
      });
    }

    return createPreflightResult('audio', audioPermissions);
  }

  const videoPermissions = await requestPermissions({
    requireCamera: true,
    requireMicrophone: true,
  });

  if (!videoPermissions.supported) {
    return createPreflightResult('video', videoPermissions, {
      ready: false,
      reason: 'unsupported',
    });
  }

  if (videoPermissions.camera === 'granted' && videoPermissions.microphone === 'granted') {
    return createPreflightResult('video', videoPermissions);
  }

  if (allowAudioFallback) {
    const audioPermissions = await requestPermissions({
      requireCamera: false,
      requireMicrophone: true,
    });

    if (!audioPermissions.supported) {
      return createPreflightResult('video', audioPermissions, {
        ready: false,
        reason: 'unsupported',
      });
    }

    if (audioPermissions.microphone !== 'granted') {
      return createPreflightResult('video', audioPermissions, {
        ready: false,
        reason: resolveMicrophoneFailureReason(audioPermissions.microphone),
      });
    }

    const fallbackReason = videoPermissions.camera !== 'granted'
      ? resolveCameraFailureReason(videoPermissions.camera)
      : resolveMicrophoneFailureReason(videoPermissions.microphone);

    return createPreflightResult('audio', audioPermissions, {
      fallbackApplied: true,
      reason: fallbackReason,
    });
  }

  if (videoPermissions.microphone !== 'granted') {
    return createPreflightResult('video', videoPermissions, {
      ready: false,
      reason: resolveMicrophoneFailureReason(videoPermissions.microphone),
    });
  }

  return createPreflightResult('video', videoPermissions, {
    ready: false,
    reason: resolveCameraFailureReason(videoPermissions.camera),
  });
}

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

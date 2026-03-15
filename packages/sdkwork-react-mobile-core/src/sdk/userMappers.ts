export interface AppSdkUserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  email: string;
  phone: string;
}

export interface AppSdkUserProfileDto {
  id?: string | number | null;
  userId?: string | number | null;
  username?: string | null;
  nickname?: string | null;
  name?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
  headImgUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeId(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return normalizeString(value);
}

export function mapSdkUserProfile(dto: AppSdkUserProfileDto | null | undefined): AppSdkUserProfile {
  const id = normalizeId(dto?.id ?? dto?.userId);
  const username = normalizeString(dto?.username) || id;
  const displayName =
    normalizeString(dto?.nickname) ||
    normalizeString(dto?.name) ||
    username ||
    id;

  return {
    id,
    username: username || id,
    displayName: displayName || id,
    avatarUrl:
      normalizeString(dto?.avatarUrl) ||
      normalizeString(dto?.avatar) ||
      normalizeString(dto?.headImgUrl),
    email: normalizeString(dto?.email),
    phone: normalizeString(dto?.phone) || normalizeString(dto?.mobile),
  };
}

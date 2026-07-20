const CERTIFICATES_PATH = '/certificates';
const PROJECT_IMAGES_PATH = '/images/projects';

export const PROFILE_IMAGE_URL = '/images/profile.jpg';

export function getFilenameFromUrl(value: string): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const normalized = value.trim();
    const pathname = /^https?:\/\//i.test(normalized)
      ? new URL(normalized).pathname
      : normalized;
    const filename = pathname.split('/').filter(Boolean).pop();
    return filename ? decodeURIComponent(filename) : null;
  } catch {
    return null;
  }
}

export function isSupabaseUrl(value: string): boolean {
  return typeof value === 'string' && /\.supabase\.co\//i.test(value);
}

export function getCertificateUrl(value: string): string {
  if (!value) return '';
  if (value.startsWith(CERTIFICATES_PATH)) return value;

  if (/^https?:\/\//i.test(value) && !isSupabaseUrl(value)) {
    return value;
  }

  const filename = getFilenameFromUrl(value);
  return filename ? `${CERTIFICATES_PATH}/${encodeURIComponent(filename)}` : '';
}

export function getProfileImageUrl(): string {
  return PROFILE_IMAGE_URL;
}

export function getStorageUrl(bucket: string, objectPath: string): string {
  const cleanPath = objectPath.replace(/^\/+/, '');

  if (bucket === 'certificates') return `${CERTIFICATES_PATH}/${cleanPath}`;
  if (bucket === 'profile-images') return PROFILE_IMAGE_URL;
  if (bucket === 'project-images') return `${PROJECT_IMAGES_PATH}/${cleanPath}`;

  return `/assets/${encodeURIComponent(bucket)}/${cleanPath}`;
}

import type { FileFilter } from './types';

export interface FilePickerPickedFileLike {
  path?: string | null;
  uri?: string | null;
  name?: string | null;
}

function normalizeExtension(extension: string): string {
  const trimmed = extension.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
}

export function toFilePickerTypes(filters?: FileFilter[]): string[] | undefined {
  if (!filters?.length) return undefined;

  const unique = new Set<string>();
  for (const filter of filters) {
    for (const extension of filter.extensions) {
      const normalized = normalizeExtension(extension);
      if (normalized) {
        unique.add(normalized);
      }
    }
  }

  const result = Array.from(unique);
  return result.length > 0 ? result : undefined;
}

function normalizePath(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function normalizePickedFiles(files?: FilePickerPickedFileLike[] | null): string[] | null {
  if (!files?.length) return null;

  const paths = files
    .map((file) => normalizePath(file.path) || normalizePath(file.uri) || normalizePath(file.name))
    .filter((value): value is string => Boolean(value));

  return paths.length > 0 ? paths : null;
}

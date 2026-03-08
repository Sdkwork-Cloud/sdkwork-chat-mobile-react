import { describe, expect, it } from 'vitest';
import { normalizePickedFiles, toFilePickerTypes } from '../src/platform/filePicker';

describe('file picker helpers', () => {
  it('normalizes and deduplicates file extensions for file picker options', () => {
    const result = toFilePickerTypes([
      { name: 'Images', extensions: ['png', '.jpg', ' png '] },
      { name: 'Docs', extensions: ['pdf', '', 'docx'] },
    ]);

    expect(result).toEqual(['.png', '.jpg', '.pdf', '.docx']);
  });

  it('returns null when no picked file path can be resolved', () => {
    const result = normalizePickedFiles([
      { path: '   ', uri: '', name: '   ' },
      {},
    ]);

    expect(result).toBeNull();
  });

  it('prefers path, then uri, then name when normalizing picked files', () => {
    const result = normalizePickedFiles([
      { path: '/documents/a.pdf', uri: 'ignored', name: 'ignored-name' },
      { uri: 'content://media/123' },
      { name: 'fallback-name.png' },
    ]);

    expect(result).toEqual(['/documents/a.pdf', 'content://media/123', 'fallback-name.png']);
  });
});

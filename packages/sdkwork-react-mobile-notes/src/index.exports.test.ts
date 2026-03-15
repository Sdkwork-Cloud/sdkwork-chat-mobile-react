import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('notes package exports contract', () => {
  it('exposes module pages, workspace hook, and service from package index', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf8');

    expect(source).toContain("export { NotesPage, NotesDocPage, NotesCreatePage } from './pages';");
    expect(source).toContain("export { useNotesWorkspace } from './hooks/useNotesWorkspace';");
    expect(source).toContain("export { notesService, createNotesService } from './services/NotesService';");
    expect(source).toContain('export type {');
    expect(source).toContain('NotesWorkspaceSnapshot');
    expect(source).toContain('NotesService');
  });
});

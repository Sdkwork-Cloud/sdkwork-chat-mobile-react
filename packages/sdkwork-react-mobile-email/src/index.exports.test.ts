import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('email package exports contract', () => {
  it('exposes module pages, workspace hook, and service from package index', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf8');

    expect(source).toContain("export { EmailPage, EmailThreadPage, EmailComposePage } from './pages';");
    expect(source).toContain("export { useEmailWorkspace } from './hooks/useEmailWorkspace';");
    expect(source).toContain("export { emailService, createEmailService } from './services/EmailService';");
    expect(source).toContain('export type {');
    expect(source).toContain('EmailWorkspaceSnapshot');
    expect(source).toContain('EmailService');
  });
});

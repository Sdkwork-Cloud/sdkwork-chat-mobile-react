import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('LoginPage store flow', () => {
  it('submits credentials through the auth store login action', () => {
    const source = fs.readFileSync(path.join(__dirname, 'LoginPage.tsx'), 'utf8');

    expect(source).toContain('const login = useAuthStore((state) => state.login);');
    expect(source).toContain('const clearError = useAuthStore((state) => state.clearError);');
    expect(source).toContain('const success = await login(username, password);');
  });

  it('uses store error state to drive failure feedback after submit', () => {
    const source = fs.readFileSync(path.join(__dirname, 'LoginPage.tsx'), 'utf8');

    expect(source).toContain('const latestError = useAuthStore.getState().error;');
    expect(source).toContain("Toast.error(latestError || tr('auth_login_failed', 'Login failed'));");
    expect(source).toContain("Toast.success(tr('auth_login_success', 'Login successful'));");
  });
});

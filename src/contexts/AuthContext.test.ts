import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('AuthContext startup wiring', () => {
  it('initializes auth once through AuthProvider startup effect', () => {
    const source = fs.readFileSync(path.join(__dirname, 'AuthContext.tsx'), 'utf8');

    expect(source).toContain('const initializeAuth = useAuthStore((state) => state.initializeAuth);');
    expect(source).toContain('useEffect(() => {');
    expect(source).toContain('void initializeAuth();');
  });

  it('clears current user state when auth becomes logged out', () => {
    const source = fs.readFileSync(path.join(__dirname, 'AuthContext.tsx'), 'utf8');

    expect(source).toContain("const authStatus = useAuthStore((state) => state.authStatus);");
    expect(source).toContain('const clearCurrentUser = useUserStore((state) => state.clearCurrentUser);');
    expect(source).toContain("if (authStatus === 'logged_out') {");
    expect(source).toContain('clearCurrentUser();');
  });
});

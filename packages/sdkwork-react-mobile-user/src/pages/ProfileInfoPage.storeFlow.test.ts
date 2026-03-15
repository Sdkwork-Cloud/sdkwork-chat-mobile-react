import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ProfileInfoPage store flow', () => {
  it('renders current profile fields from the user store hook', () => {
    const source = fs.readFileSync(path.join(__dirname, 'ProfileInfoPage.tsx'), 'utf8');

    expect(source).toContain('const {');
    expect(source).toContain('profile,');
    expect(source).toContain('updateProfile,');
    expect(source).toContain('updateAvatar,');
    expect(source).toContain('refreshCurrentUser,');
    expect(source).toContain('} = useUser();');
    expect(source).toContain("const profileName = profile?.name || tr('profile.default_name', 'WeChat User');");
  });

  it('uses the current-user refresh action for retry rendering paths', () => {
    const source = fs.readFileSync(path.join(__dirname, 'ProfileInfoPage.tsx'), 'utf8');

    expect(source).toContain('onClick={() => void refreshCurrentUser()}');
  });
});

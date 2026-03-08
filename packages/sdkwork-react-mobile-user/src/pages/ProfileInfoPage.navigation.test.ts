import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ProfileInfoPage field editing navigation', () => {
  it('uses dedicated page callbacks for profile and binding editing', () => {
    const source = fs.readFileSync(path.join(__dirname, 'ProfileInfoPage.tsx'), 'utf8');

    expect(source).toContain('onEditNameClick?: () => void;');
    expect(source).toContain('onEditRegionClick?: () => void;');
    expect(source).toContain('onEditSignatureClick?: () => void;');
    expect(source).toContain('onEditPasswordClick?: () => void;');
    expect(source).toContain('onEditPhoneClick?: () => void;');
    expect(source).toContain('onEditEmailClick?: () => void;');
    expect(source).toContain('onEditWechatClick?: () => void;');
    expect(source).toContain('onEditQqClick?: () => void;');

    expect(source).toContain('onClick={onEditNameClick}');
    expect(source).toContain('onClick={onEditRegionClick}');
    expect(source).toContain('onClick={onEditSignatureClick}');
    expect(source).toContain('onClick={onEditPasswordClick}');
    expect(source).toContain('onClick={onEditPhoneClick}');
    expect(source).toContain('onClick={onEditEmailClick}');
    expect(source).toContain('onClick={onEditWechatClick}');
    expect(source).toContain('onClick={onEditQqClick}');
  });

  it('does not keep inline bottom-sheet editing in profile info page', () => {
    const source = fs.readFileSync(path.join(__dirname, 'ProfileInfoPage.tsx'), 'utf8');

    expect(source).not.toContain('const [editingField, setEditingField]');
    expect(source).not.toContain('const saveEditor = async');
    expect(source).not.toContain("openEditor('name')");
    expect(source).not.toContain("openEditor('region')");
    expect(source).not.toContain("openEditor('signature')");
    expect(source).not.toContain("openEditor('password')");
    expect(source).not.toContain('const [bindingEditor, setBindingEditor]');
    expect(source).not.toContain('const saveBindingEditor = async');
    expect(source).not.toContain('className="profile-info-page__sheet user-center-sheet"');
  });
});

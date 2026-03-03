import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Catalog 中的依赖列表
const catalogDeps = [
  'react', 'react-dom', 'react-router-dom',
  'zustand', 'immer',
  'i18next', 'react-i18next',
  'date-fns', 'uuid', 'classnames',
  'lucide-react',
];

// 获取最新版本
function getLatestVersion(pkg) {
  try {
    const result = execSync(`npm view ${pkg} version`, { encoding: 'utf-8' });
    return result.trim();
  } catch (e) {
    console.error(`Failed to get version for ${pkg}:`, e.message);
    return null;
  }
}

// 更新 pnpm-workspace.yaml 中的 catalog 版本
function updateCatalogVersions() {
  const workspaceFile = path.join(__dirname, '..', 'pnpm-workspace.yaml');
  let content = fs.readFileSync(workspaceFile, 'utf-8');

  for (const dep of catalogDeps) {
    const version = getLatestVersion(dep);
    if (version) {
      const regex = new RegExp(`(${dep}):\\s*['"]?[^\\s'"]+['"]?`, 'g');
      content = content.replace(regex, `$1: ^${version}`);
      console.log(`Updated ${dep} to ^${version}`);
    }
  }

  fs.writeFileSync(workspaceFile, content);
  console.log('Catalog versions updated successfully!');
}

updateCatalogVersions();

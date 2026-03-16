import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = path.resolve(__dirname, '..');

describe('run-with-project-java-home', () => {
  it('reads org.gradle.java.home from gradle properties content', async () => {
    const modulePath = path.join(repoRoot, 'scripts', 'run-with-project-java-home.mjs');
    const scriptModule = await import(pathToFileURL(modulePath).href);

    expect(
      scriptModule.parseProjectJavaHome(
        'org.gradle.java.home=C:\\\\Program Files\\\\Java\\\\jdk-21',
      ),
    ).toBe('C:\\Program Files\\Java\\jdk-21');
  });

  it('creates a child process env with JAVA_HOME and prefixed PATH', async () => {
    const modulePath = path.join(repoRoot, 'scripts', 'run-with-project-java-home.mjs');
    const scriptModule = await import(pathToFileURL(modulePath).href);

    const env = scriptModule.createProjectJavaEnv({
      gradlePropertiesContent: 'org.gradle.java.home=C:\\\\Program Files\\\\Java\\\\jdk-21',
      baseEnv: {
        PATH: 'C:\\Windows\\System32',
      },
      platform: 'win32',
    });

    expect(env.JAVA_HOME).toBe('C:\\Program Files\\Java\\jdk-21');
    expect(env.PATH).toBe('C:\\Program Files\\Java\\jdk-21\\bin;C:\\Windows\\System32');
  });

  it('routes android root scripts through the project java home wrapper', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'),
    ) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts['cap:open:android']).toContain('run-with-project-java-home.mjs');
    expect(packageJson.scripts['cap:run:android']).toContain('run-with-project-java-home.mjs');
  });

  it('documents that android uses project java 21 without changing global java 25', () => {
    const capacitorBuildStandard = fs.readFileSync(
      path.join(repoRoot, 'docs', 'capacitor-build-standard.md'),
      'utf8',
    );
    const packagingGuide = fs.readFileSync(
      path.join(repoRoot, 'docs', 'app-packaging-and-deployment.md'),
      'utf8',
    );
    const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');

    expect(capacitorBuildStandard).toContain('Java 21');
    expect(capacitorBuildStandard).toContain('Java 25');
    expect(capacitorBuildStandard).toContain('Android Studio');

    expect(packagingGuide).toContain('Java 21');
    expect(packagingGuide).toContain('Java 25');
    expect(packagingGuide).toContain('Android Studio');

    expect(readme).toContain('Java 21');
    expect(readme).toContain('Java 25');
  });
});

#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROJECT_JAVA_HOME_KEY = 'org.gradle.java.home';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_GRADLE_PROPERTIES_PATH = path.join(REPO_ROOT, 'android', 'gradle.properties');

export function parseProjectJavaHome(gradlePropertiesContent) {
  const lines = gradlePropertiesContent.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    if (!trimmed.startsWith(`${PROJECT_JAVA_HOME_KEY}=`)) {
      continue;
    }

    const rawValue = trimmed.slice(`${PROJECT_JAVA_HOME_KEY}=`.length).trim();
    if (!rawValue) {
      throw new Error(`Missing value for ${PROJECT_JAVA_HOME_KEY}`);
    }

    return rawValue.replace(/\\\\/g, '\\');
  }

  throw new Error(`Missing ${PROJECT_JAVA_HOME_KEY} in android/gradle.properties`);
}

export function createProjectJavaEnv({
  gradlePropertiesContent,
  baseEnv = process.env,
  platform = process.platform,
}) {
  const javaHome = parseProjectJavaHome(gradlePropertiesContent);
  const pathKey = Object.keys(baseEnv).find((key) => key.toUpperCase() === 'PATH') || 'PATH';
  const pathDelimiter = platform === 'win32' ? ';' : ':';
  const javaBinPath = path.join(javaHome, 'bin');
  const currentPath = baseEnv[pathKey] || '';

  return {
    ...baseEnv,
    JAVA_HOME: javaHome,
    [pathKey]: currentPath ? `${javaBinPath}${pathDelimiter}${currentPath}` : javaBinPath,
  };
}

export function resolveProjectJavaHome({
  gradlePropertiesPath = DEFAULT_GRADLE_PROPERTIES_PATH,
} = {}) {
  const gradlePropertiesContent = fs.readFileSync(gradlePropertiesPath, 'utf8');
  const javaHome = parseProjectJavaHome(gradlePropertiesContent);

  if (!fs.existsSync(javaHome)) {
    throw new Error(`Configured project Java home does not exist: ${javaHome}`);
  }

  return javaHome;
}

export async function runWithProjectJavaHome(commandArgs, {
  repoRoot = REPO_ROOT,
  baseEnv = process.env,
} = {}) {
  const effectiveArgs = commandArgs[0] === '--' ? commandArgs.slice(1) : commandArgs;
  if (effectiveArgs.length === 0) {
    throw new Error('Missing child command. Usage: node scripts/run-with-project-java-home.mjs -- <command>');
  }

  const gradlePropertiesPath = path.join(repoRoot, 'android', 'gradle.properties');
  const gradlePropertiesContent = fs.readFileSync(gradlePropertiesPath, 'utf8');
  const env = createProjectJavaEnv({
    gradlePropertiesContent,
    baseEnv,
  });

  if (!fs.existsSync(env.JAVA_HOME)) {
    throw new Error(`Configured project Java home does not exist: ${env.JAVA_HOME}`);
  }

  return await new Promise((resolve, reject) => {
    const child = spawn(effectiveArgs[0], effectiveArgs.slice(1), {
      cwd: repoRoot,
      env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      resolve(code ?? 1);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--print-java-home') {
    console.log(resolveProjectJavaHome());
    return;
  }

  const exitCode = await runWithProjectJavaHome(args);
  if (exitCode !== 0) {
    process.exitCode = exitCode;
  }
}

if (process.argv[1] === __filename) {
  main().catch((error) => {
    console.error('[run-with-project-java-home] Failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

# Project Java 21 Isolation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure Android and Capacitor workflows in this repository use Java 21 without changing the machine-wide Java 25 default.

**Architecture:** Keep `android/gradle.properties` as the source of truth for the project JDK, then add a small repository-local wrapper that launches Android-specific child commands with a Java 21-scoped environment. Rewire root scripts to use that wrapper and document the contract for CLI and Android Studio users.

**Tech Stack:** Node.js, ES modules, pnpm scripts, Capacitor, Gradle properties, Vitest.

---

### Task 1: Add a Project Java Home Resolver and Runner

**Files:**
- Create: `scripts/run-with-project-java-home.mjs`
- Create: `scripts/run-with-project-java-home.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { createProjectJavaEnv } from './run-with-project-java-home.mjs';

describe('createProjectJavaEnv', () => {
  it('reads org.gradle.java.home from android/gradle.properties', () => {
    const env = createProjectJavaEnv({
      gradlePropertiesContent: 'org.gradle.java.home=C:\\\\Program Files\\\\Java\\\\jdk-21',
      baseEnv: { PATH: 'C:\\\\Windows\\\\System32' },
      platform: 'win32',
    });

    expect(env.JAVA_HOME).toBe('C:\\Program Files\\Java\\jdk-21');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run scripts/run-with-project-java-home.test.ts`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write the minimal implementation**

```ts
export function createProjectJavaEnv(input) {
  const javaHome = readJavaHomeFromGradleProperties(input.gradlePropertiesContent);
  return {
    ...input.baseEnv,
    JAVA_HOME: javaHome,
    PATH: `${path.join(javaHome, 'bin')}${path.delimiter}${input.baseEnv.PATH || ''}`,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run scripts/run-with-project-java-home.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/run-with-project-java-home.mjs scripts/run-with-project-java-home.test.ts
git commit -m "build(android): add project java home runner"
```

### Task 2: Rewire Android Root Scripts to Use Project Java 21

**Files:**
- Modify: `package.json`

**Step 1: Write the failing contract test**

Extend `scripts/run-with-project-java-home.test.ts` with a contract assertion that the package scripts route Android run/open flows through the wrapper.

```ts
expect(packageJson.scripts['cap:run:android']).toContain('run-with-project-java-home.mjs');
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run scripts/run-with-project-java-home.test.ts`
Expected: FAIL because the package scripts still call Capacitor directly.

**Step 3: Write the minimal implementation**

Update root scripts so Android-specific command entrypoints call the wrapper, for example:

```json
{
  "cap:open:android": "node scripts/run-with-project-java-home.mjs -- pnpm exec cap open android",
  "cap:run:android": "node scripts/run-with-project-java-home.mjs -- pnpm exec cap run android"
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run scripts/run-with-project-java-home.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json scripts/run-with-project-java-home.test.ts
git commit -m "build(android): route android scripts through project java home"
```

### Task 3: Document the Project-Scoped Java 21 Contract

**Files:**
- Modify: `docs/capacitor-build-standard.md`
- Modify: `docs/app-packaging-and-deployment.md`
- Modify: `README.md`

**Step 1: Write the failing documentation contract test**

Extend `scripts/run-with-project-java-home.test.ts` to assert that docs mention:

- project Android workflows use Java 21
- global Java 25 may remain unchanged
- Android Studio should use the project Java 21 setting

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run scripts/run-with-project-java-home.test.ts`
Expected: FAIL because the docs do not fully describe the Java isolation contract yet.

**Step 3: Write the minimal implementation**

Document:

- `android/gradle.properties` as the source of truth
- root Android scripts run with project Java 21
- Android Studio Gradle JDK must point to Java 21 for this project

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run scripts/run-with-project-java-home.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/capacitor-build-standard.md docs/app-packaging-and-deployment.md README.md scripts/run-with-project-java-home.test.ts
git commit -m "docs(android): document project-scoped java 21 usage"
```

### Task 4: Final Verification

**Files:**
- Verify all files touched in Tasks 1-3

**Step 1: Run focused tests**

Run: `pnpm.cmd exec vitest run scripts/run-with-project-java-home.test.ts`
Expected: PASS.

**Step 2: Verify the effective project Java home**

Run: `node scripts/run-with-project-java-home.mjs -- node -e "console.log(process.env.JAVA_HOME)"`
Expected: prints `C:\Program Files\Java\jdk-21`

**Step 3: Verify Capacitor doctor still works through the current environment**

Run: `pnpm.cmd cap:doctor`
Expected: PASS.

**Step 4: Commit**

```bash
git add package.json scripts/run-with-project-java-home.mjs scripts/run-with-project-java-home.test.ts docs/capacitor-build-standard.md docs/app-packaging-and-deployment.md README.md docs/plans/2026-03-10-project-java-21-isolation-design.md docs/plans/2026-03-10-project-java-21-isolation-implementation-plan.md
git commit -m "build(android): isolate project java 21 runtime"
```

# Regional Mobile Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a region-aware mobile architecture that supports mainland China and overseas users with different push, map, packaging, and deployment strategies while keeping one main codebase.

**Architecture:** Introduce a formal build profile model, a regional provider registry, and unified region-aware push/map abstractions in core runtime. Then wire Android flavors, iOS schemes/configuration assets, and web/PWA profile injection around those abstractions so mainland and overseas packages can be built and validated independently.

**Tech Stack:** React, TypeScript, Capacitor, Vite, Vitest, Android product flavors, Xcode schemes/build settings, Node.js validation scripts.

---

### Task 1: Add Build Profile and Region Domain Model

**Files:**
- Create: `packages/sdkwork-react-mobile-core/src/region/types.ts`
- Create: `packages/sdkwork-react-mobile-core/src/region/profile.ts`
- Create: `packages/sdkwork-react-mobile-core/src/region/index.ts`
- Create: `packages/sdkwork-react-mobile-core/src/region/profile.test.ts`
- Modify: `packages/sdkwork-react-mobile-core/src/index.ts`

**Step 1: Write the failing profile tests**

```ts
import { describe, expect, it } from 'vitest';
import { createBuildProfile } from './profile';

describe('createBuildProfile', () => {
  it('normalizes cn android store production profile', () => {
    expect(
      createBuildProfile({
        region: 'cn',
        platform: 'android',
        environment: 'production',
        distribution: 'store',
      }).id,
    ).toBe('android-cn-production-store');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/region/profile.test.ts`
Expected: FAIL because the region/profile domain does not exist yet.

**Step 3: Write the minimal implementation**

```ts
export function createBuildProfile(input: BuildProfileInput): BuildProfile {
  const region = normalizeRegion(input.region);
  const platform = normalizePlatform(input.platform);
  const environment = normalizeEnvironment(input.environment);
  const distribution = normalizeDistribution(input.distribution);

  return {
    region,
    platform,
    environment,
    distribution,
    id: `${platform}-${region}-${environment}-${distribution}`,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/region/profile.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-core/src/region/types.ts packages/sdkwork-react-mobile-core/src/region/profile.ts packages/sdkwork-react-mobile-core/src/region/index.ts packages/sdkwork-react-mobile-core/src/region/profile.test.ts packages/sdkwork-react-mobile-core/src/index.ts
git commit -m "feat(region): add build profile domain model"
```

### Task 2: Add Regional Provider Registry

**Files:**
- Create: `packages/sdkwork-react-mobile-core/src/region/providerRegistry.ts`
- Create: `packages/sdkwork-react-mobile-core/src/region/providerRegistry.test.ts`
- Modify: `packages/sdkwork-react-mobile-core/src/region/index.ts`

**Step 1: Write the failing registry tests**

```ts
it('uses fcm for android global push defaults', () => {
  expect(resolveRegionalProviders(createBuildProfile({
    region: 'global',
    platform: 'android',
    environment: 'production',
    distribution: 'store',
  })).push).toBe('fcm');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/region/providerRegistry.test.ts`
Expected: FAIL because the provider registry does not exist yet.

**Step 3: Write the minimal implementation**

```ts
export function resolveRegionalProviders(profile: BuildProfile): RegionalProviders {
  if (profile.platform === 'android' && profile.region === 'cn') {
    return { push: 'hms_push', map: 'amap', geocode: 'amap', navigation: 'amap' };
  }
  if (profile.platform === 'android') {
    return { push: 'fcm', map: 'google_maps', geocode: 'google_maps', navigation: 'google_maps' };
  }
  if (profile.platform === 'ios' && profile.region === 'cn') {
    return { push: 'apns', map: 'amap', geocode: 'amap', navigation: 'apple_maps' };
  }
  return { push: 'apns', map: 'apple_maps', geocode: 'apple_maps', navigation: 'apple_maps' };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/region/providerRegistry.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-core/src/region/providerRegistry.ts packages/sdkwork-react-mobile-core/src/region/providerRegistry.test.ts packages/sdkwork-react-mobile-core/src/region/index.ts
git commit -m "feat(region): add provider registry"
```

### Task 3: Introduce Region-Aware Push Abstractions

**Files:**
- Create: `packages/sdkwork-react-mobile-core/src/push/types.ts`
- Create: `packages/sdkwork-react-mobile-core/src/push/fallbackPolicy.ts`
- Create: `packages/sdkwork-react-mobile-core/src/push/fallbackPolicy.test.ts`
- Modify: `packages/sdkwork-react-mobile-core/src/platform/types.ts`
- Modify: `packages/sdkwork-react-mobile-core/src/platform/runtime.ts`
- Modify: `packages/sdkwork-react-mobile-core/src/platform/runtimeHooks.ts`

**Step 1: Write the failing push fallback tests**

```ts
it('marks browser push as degraded but not fatal', () => {
  const result = resolvePushFallback({
    platform: 'web',
    supported: false,
    defaultProvider: 'browser_push',
  });
  expect(result.mode).toBe('degraded');
  expect(result.enableInboxSync).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/push/fallbackPolicy.test.ts`
Expected: FAIL because the region-aware push abstractions are missing.

**Step 3: Write the minimal implementation**

```ts
export function resolvePushFallback(input: PushFallbackInput): PushFallbackResult {
  if (!input.supported) {
    return {
      mode: 'degraded',
      enableInboxSync: true,
      enableForegroundSync: true,
    };
  }
  return {
    mode: 'native',
    enableInboxSync: true,
    enableForegroundSync: true,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/push/fallbackPolicy.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-core/src/push/types.ts packages/sdkwork-react-mobile-core/src/push/fallbackPolicy.ts packages/sdkwork-react-mobile-core/src/push/fallbackPolicy.test.ts packages/sdkwork-react-mobile-core/src/platform/types.ts packages/sdkwork-react-mobile-core/src/platform/runtime.ts packages/sdkwork-react-mobile-core/src/platform/runtimeHooks.ts
git commit -m "feat(push): add region-aware push abstraction"
```

### Task 4: Add Location, Map, and Coordinate Domain Model

**Files:**
- Create: `packages/sdkwork-react-mobile-core/src/location/types.ts`
- Create: `packages/sdkwork-react-mobile-core/src/location/coordinateTransform.ts`
- Create: `packages/sdkwork-react-mobile-core/src/location/coordinateTransform.test.ts`
- Create: `packages/sdkwork-react-mobile-core/src/location/providerPolicy.ts`
- Modify: `packages/sdkwork-react-mobile-core/src/index.ts`

**Step 1: Write the failing coordinate tests**

```ts
it('uses wgs84 as canonical coordinate system', () => {
  const point = createGeoPoint({ lat: 39.9, lng: 116.4 });
  expect(point.coordSystem).toBe('wgs84');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/location/coordinateTransform.test.ts`
Expected: FAIL because the location domain does not exist yet.

**Step 3: Write the minimal implementation**

```ts
export function createGeoPoint(input: { lat: number; lng: number }): GeoPoint {
  return {
    lat: input.lat,
    lng: input.lng,
    coordSystem: 'wgs84',
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/location/coordinateTransform.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-core/src/location/types.ts packages/sdkwork-react-mobile-core/src/location/coordinateTransform.ts packages/sdkwork-react-mobile-core/src/location/coordinateTransform.test.ts packages/sdkwork-react-mobile-core/src/location/providerPolicy.ts packages/sdkwork-react-mobile-core/src/index.ts
git commit -m "feat(location): add region-aware map and coordinate domain"
```

### Task 5: Wire Profile Resolution into Root App and Web/PWA Runtime

**Files:**
- Create: `src/config/buildProfile.ts`
- Create: `src/config/buildProfile.test.ts`
- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `src/app/App.tsx`
- Modify: `index.html`

**Step 1: Write the failing root profile tests**

```ts
it('resolves region and distribution from vite env', () => {
  expect(resolveRootBuildProfile({
    VITE_REGION: 'cn',
    VITE_ENVIRONMENT: 'production',
    VITE_DISTRIBUTION: 'store',
  }).id).toBe('web-cn-production-store');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run src/config/buildProfile.test.ts`
Expected: FAIL because the root profile resolver does not exist yet.

**Step 3: Write the minimal implementation**

```ts
export function resolveRootBuildProfile(env: Record<string, string | undefined>) {
  return createBuildProfile({
    region: env.VITE_REGION || 'global',
    platform: 'web',
    environment: env.VITE_ENVIRONMENT || 'development',
    distribution: env.VITE_DISTRIBUTION || 'internal',
  });
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run src/config/buildProfile.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/config/buildProfile.ts src/config/buildProfile.test.ts vite.config.ts package.json src/app/App.tsx index.html
git commit -m "feat(profile): wire regional profile into root app"
```

### Task 6: Add Android Regional Flavor Structure

**Files:**
- Modify: `android/app/build.gradle`
- Modify: `android/app/src/main/AndroidManifest.xml`
- Create: `android/app/src/cn/`
- Create: `android/app/src/global/`
- Create: `config/android/flavors/README.md`
- Create: `scripts/validate-android-flavors.mjs`
- Create: `scripts/validate-android-flavors.test.ts`

**Step 1: Write the failing Android flavor validation test**

```ts
it('requires cn and global android flavors', async () => {
  const result = await validateAndroidFlavors();
  expect(result.flavors).toEqual(expect.arrayContaining(['cn', 'global']));
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run scripts/validate-android-flavors.test.ts`
Expected: FAIL because Android flavor validation and flavor scaffolding are missing.

**Step 3: Write the minimal implementation**

```ts
productFlavors {
  cn {
    dimension "region"
  }
  global {
    dimension "region"
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run scripts/validate-android-flavors.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add android/app/build.gradle android/app/src/main/AndroidManifest.xml android/app/src/cn android/app/src/global config/android/flavors/README.md scripts/validate-android-flavors.mjs scripts/validate-android-flavors.test.ts
git commit -m "build(android): add regional flavor baseline"
```

### Task 7: Add iOS Regional Scheme and Configuration Templates

**Files:**
- Create: `config/ios/xcconfig/OpenChat-CN.xcconfig`
- Create: `config/ios/xcconfig/OpenChat-Global.xcconfig`
- Create: `config/ios/README-regional-builds.md`
- Create: `scripts/validate-ios-regional-config.mjs`
- Create: `scripts/validate-ios-regional-config.test.ts`
- Modify: `docs/capacitor-build-standard.md`

**Step 1: Write the failing iOS regional validation test**

```ts
it('requires regional xcconfig templates', async () => {
  const result = await validateIosRegionalConfig();
  expect(result.requiredConfigs).toEqual(
    expect.arrayContaining(['OpenChat-CN.xcconfig', 'OpenChat-Global.xcconfig']),
  );
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run scripts/validate-ios-regional-config.test.ts`
Expected: FAIL because no regional iOS build templates exist yet.

**Step 3: Write the minimal implementation**

```ini
PRODUCT_BUNDLE_IDENTIFIER = com.openchat.ai.cn
SDKWORK_REGION = cn
SDKWORK_DISTRIBUTION = store
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run scripts/validate-ios-regional-config.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add config/ios/xcconfig/OpenChat-CN.xcconfig config/ios/xcconfig/OpenChat-Global.xcconfig config/ios/README-regional-builds.md scripts/validate-ios-regional-config.mjs scripts/validate-ios-regional-config.test.ts docs/capacitor-build-standard.md
git commit -m "build(ios): add regional configuration templates"
```

### Task 8: Add Region-Aware Packaging and Deployment Scripts

**Files:**
- Modify: `package.json`
- Modify: `docs/app-packaging-and-deployment.md`
- Create: `docs/regional-packaging-matrix.md`
- Create: `scripts/validate-regional-packaging.mjs`
- Create: `scripts/validate-regional-packaging.test.ts`

**Step 1: Write the failing packaging validation test**

```ts
it('requires explicit cn/global packaging scripts', async () => {
  const result = await validateRegionalPackagingScripts();
  expect(result.scripts).toEqual(
    expect.arrayContaining(['build:web:cn', 'build:web:global']),
  );
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run scripts/validate-regional-packaging.test.ts`
Expected: FAIL because regional packaging scripts and validation do not exist yet.

**Step 3: Write the minimal implementation**

```json
{
  "build:web:cn": "vite build --mode production",
  "build:web:global": "vite build --mode production"
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run scripts/validate-regional-packaging.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json docs/app-packaging-and-deployment.md docs/regional-packaging-matrix.md scripts/validate-regional-packaging.mjs scripts/validate-regional-packaging.test.ts
git commit -m "build(release): add regional packaging matrix"
```

### Task 9: Add Standards Gates for Region/Profile Consistency

**Files:**
- Create: `scripts/validate-regional-architecture.mjs`
- Create: `scripts/validate-regional-architecture.test.ts`
- Modify: `package.json`
- Modify: `docs/architect-standard-react+capacitor.md`

**Step 1: Write the failing architecture validation test**

```ts
it('rejects direct raw regional sdk imports in feature packages', async () => {
  const result = await validateRegionalArchitecture();
  expect(result.illegalImports).toEqual([]);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm.cmd exec vitest run scripts/validate-regional-architecture.test.ts`
Expected: FAIL because the regional architecture guard does not exist yet.

**Step 3: Write the minimal implementation**

```ts
if (path.startsWith('packages/') && source.includes('@capacitor/')) {
  illegalImports.push(path);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm.cmd exec vitest run scripts/validate-regional-architecture.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/validate-regional-architecture.mjs scripts/validate-regional-architecture.test.ts package.json docs/architect-standard-react+capacitor.md
git commit -m "chore(standards): enforce regional architecture rules"
```

### Task 10: Final Verification

**Files:**
- Verify all files touched in Tasks 1-9

**Step 1: Run targeted tests**

Run: `pnpm.cmd exec vitest run packages/sdkwork-react-mobile-core/src/region/profile.test.ts packages/sdkwork-react-mobile-core/src/region/providerRegistry.test.ts packages/sdkwork-react-mobile-core/src/push/fallbackPolicy.test.ts packages/sdkwork-react-mobile-core/src/location/coordinateTransform.test.ts src/config/buildProfile.test.ts scripts/validate-android-flavors.test.ts scripts/validate-ios-regional-config.test.ts scripts/validate-regional-packaging.test.ts scripts/validate-regional-architecture.test.ts`
Expected: PASS.

**Step 2: Run standards validation**

Run: `pnpm.cmd validate:standards`
Expected: PASS with the new regional validation gates included.

**Step 3: Run root build verification**

Run: `pnpm.cmd run build`
Expected: PASS for the active profile defaults.

**Step 4: Run Capacitor baseline verification**

Run: `pnpm.cmd validate:capacitor:baseline`
Expected: PASS with no regression in push, local notifications, geolocation, or native capability baselines.

**Step 5: Commit**

```bash
git add packages/sdkwork-react-mobile-core/src/region packages/sdkwork-react-mobile-core/src/push packages/sdkwork-react-mobile-core/src/location src/config/buildProfile.ts src/config/buildProfile.test.ts vite.config.ts package.json android/app/build.gradle android/app/src/main/AndroidManifest.xml android/app/src/cn android/app/src/global config/android/flavors/README.md config/ios/xcconfig/OpenChat-CN.xcconfig config/ios/xcconfig/OpenChat-Global.xcconfig config/ios/README-regional-builds.md docs/app-packaging-and-deployment.md docs/regional-packaging-matrix.md docs/capacitor-build-standard.md docs/architect-standard-react+capacitor.md scripts/validate-android-flavors.mjs scripts/validate-android-flavors.test.ts scripts/validate-ios-regional-config.mjs scripts/validate-ios-regional-config.test.ts scripts/validate-regional-packaging.mjs scripts/validate-regional-packaging.test.ts scripts/validate-regional-architecture.mjs scripts/validate-regional-architecture.test.ts
git commit -m "feat(region): add cn and global mobile architecture baseline"
```

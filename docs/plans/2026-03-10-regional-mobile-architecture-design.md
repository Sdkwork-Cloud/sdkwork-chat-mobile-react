# Regional Mobile Architecture Design

**Date:** 2026-03-10
**Scope:** Design a production-grade architecture for serving users in mainland China and overseas across Browser, PWA, Android, and iOS, with region-specific push, map, packaging, and deployment handling.

## 1. Goals

- Support mainland China and overseas users with one primary codebase and region-specific delivery profiles.
- Keep business pages and feature packages region-agnostic by moving regional differences into capability, provider, and build layers.
- Support different push, map, geocoding, and navigation providers by region without duplicating app flows.
- Support multiple packaging modes: internal, store, and enterprise/private distribution.
- Keep Browser, PWA, Android, and iOS aligned under one profile model.
- Ensure runtime degradation remains graceful when a provider is unavailable on a specific device or network.

## 2. Non-Goals

- No full product white-label platform in this phase.
- No region-specific duplication of routing systems or feature modules.
- No attempt to make one universal native package dynamically carry every region's production provider as the main strategy.

## 3. Verified External Constraints

The following constraints were verified against official vendor documentation on **2026-03-10**:

### 3.1 Android Build Variants

- Android officially supports using `productFlavors`, flavor dimensions, variant-aware dependency matching, and separate `applicationId` values for distribution-specific packages.
- Source: Android Developers, "Configure build variants"
  https://developer.android.com/build/build-variants

### 3.2 Firebase Cloud Messaging on Android

- FCM Android clients require Android 6.0+ devices with the Google Play Store app installed, or an emulator with Google APIs.
- Firebase recommends checking for a compatible Google Play services APK before accessing Google Play services features.
- Source: Firebase Cloud Messaging Android get-started guide
  https://firebase.google.com/docs/cloud-messaging/android/get-started

### 3.3 Firebase on Apple Platforms

- Messages targeting Apple apps are delivered through APNs.
- Source: Firebase Cloud Messaging Apple receive-messages guide
  https://firebase.google.com/docs/cloud-messaging/ios/receive-messages

### 3.4 Google Maps on Android

- Google Maps SDK for Android requires an API key and billing to be enabled.
- Recent Google documentation also ties some advanced renderer/platform requirements to Google Play services.
- Sources:
  https://developers.google.com/maps/documentation/android-sdk/overview
  https://developers.google.com/maps/documentation/android-sdk/usage-and-billing
  https://developers.google.com/maps/documentation/android-sdk/cloud-customization/legacy-setup

### 3.5 Apple Maps

- Apple officially supports MapKit for apps and MapKit JS for websites.
- Source: Apple Maps developer portal
  https://developer.apple.com/maps/
  https://developer.apple.com/maps/web/

### 3.6 Huawei Push Kit

- Huawei Push Kit officially supports Android, iOS, Web, Quick App, and HarmonyOS.
- Source: Huawei Push Kit
  https://developer.huawei.com/consumer/en/hms/huawei-pushkit

### 3.7 Huawei Map Kit

- Huawei documentation states that Map Kit is currently unavailable in the Chinese mainland.
- Source: Huawei codelab
  https://developer.huawei.com/consumer/en/codelab/MotionTracking-Location-Map/

### 3.8 iOS Build Configuration

- Apple officially supports configuring app bundle values through build settings and generated `Info.plist` values.
- Source: Apple Developer documentation
  https://developer.apple.com/documentation/bundleresources/managing-your-app-s-information-property-list

## 4. Core Architectural Decision

Use **one main codebase with region-aware build profiles**, where:

- **Region selection is primarily a build-time concern**
- **Provider availability is a runtime concern**
- **Feature modules consume unified domain services, never raw regional SDKs**

Recommended high-level strategy:

- `android-cn`: mainland-optimized package
- `android-global`: overseas-optimized package
- `ios-cn`: mainland-optimized profile
- `ios-global`: overseas-optimized profile
- `web-cn`: mainland-optimized browser/PWA profile
- `web-global`: overseas-optimized browser/PWA profile

This avoids the fragility of a universal app package that tries to make region selection entirely dynamic.

## 5. Profile Model

All release logic should derive from a standard profile tuple:

- `region`: `cn | global`
- `environment`: `development | staging | production`
- `distribution`: `internal | store | enterprise`
- `platform`: `android | ios | web`

Examples:

- `android-cn-production-store`
- `android-global-staging-internal`
- `ios-cn-production-store`
- `ios-global-production-store`
- `web-cn-production-store`
- `web-global-production-store`

This profile becomes the source of truth for:

- provider defaults
- native project settings
- build scripts
- app identity
- API/CDN endpoints
- capability validation
- packaging and release artifact naming

## 6. Architectural Layers

### 6.1 Product Shell Layer

- Root app shell continues to own routing, layout, tabbar, theme, provider composition, and app bootstrap.
- It must not own region-specific push or map branching logic.

### 6.2 Regional Capability Layer

Introduce a dedicated regional architecture layer responsible for:

- build profile resolution
- provider registry
- runtime capability resolution
- legal/compliance policy selection
- regional feature availability

This layer is the only place that knows:

- which region the build targets
- which providers are the defaults
- which fallbacks are legal and supported

### 6.3 Platform Runtime Core Layer

`@sdkwork/react-mobile-core/platform` remains the platform authority for:

- native wrappers
- runtime hooks
- capability inspection
- lifecycle binding
- region-aware platform service integration

### 6.4 Native Container Layer

Android and iOS native projects own:

- package identifiers
- manifest/plist differences
- SDK dependencies
- signing
- store packaging

### 6.5 Standards and Validation Layer

Scripts, tests, and docs must enforce:

- provider/profile consistency
- region packaging rules
- SDK selection rules
- compliance metadata rules
- fallback readiness

## 7. Build-Time vs Runtime Responsibilities

### 7.1 Build-Time Responsibilities

Build-time must decide:

- app name
- bundle id / `applicationId`
- push SDK integration
- map SDK integration
- API base URL defaults
- region-specific assets and icons
- region-specific manifest/plist values
- store-specific configuration
- public client config defaults

### 7.2 Runtime Responsibilities

Runtime must decide:

- whether default providers are available on the current device
- whether the network can reach them
- whether the device supports GMS/HMS/Apple services
- whether the app should degrade to inbox sync or external navigation
- whether feature flags or kill switches override defaults

## 8. Push Architecture

### 8.1 Push Layers

Push must be split into:

- `PushDomainService`
- `PushProviderAdapter`
- `PushRuntimeRegistrar`
- `PushGatewayContract`
- `PushFallbackPolicy`

### 8.2 Recommended Provider Defaults

- `ios-cn` and `ios-global`
  - Apple devices ultimately rely on APNs
  - regional difference mainly lives in profile, backend routing, and app identity

- `android-global`
  - default push provider: FCM

- `android-cn`
  - default push provider: HMS Push
  - reserve adapter slots for OEM vendor expansion if needed

- `web`
  - browser push is optional enhancement, never the only notification path

### 8.3 Required Fallbacks

All regions/platforms must support:

- in-app inbox
- foreground sync compensation
- app-foreground retry flush
- token refresh and invalidation handling

### 8.4 Device Registration Model

Client registration payload must include:

- region
- platform
- channel
- build profile
- provider
- token
- device brand
- ROM/service capability indicators
- app version
- locale
- timezone

## 9. Map and Location Architecture

### 9.1 Map Capability Split

Map architecture must separate:

- `locationProvider`
- `geocodeProvider`
- `mapRenderProvider`
- `navigationProvider`

### 9.2 Recommended Provider Defaults

- `cn-android`
  - map rendering/geocode/navigation defaults: AMap or Baidu stack

- `cn-ios`
  - mainland default: AMap-style provider if experience parity is required
  - optional fallback: Apple Maps for external navigation

- `global-android`
  - Google Maps stack

- `global-ios`
  - Apple Maps / MapKit first

- `web-global`
  - Apple MapKit JS or other approved global web provider

- `web-cn`
  - mainland web map provider path, not Google-dependent by default

### 9.3 Coordinate System Standard

The domain layer must standardize on **WGS84** as the canonical interchange format.

Provider adapters must handle conversion when needed:

- AMap/Baidu-specific provider requirements
- mainland route planning provider inputs
- provider-specific output normalization back to canonical objects

Business pages and features must never perform coordinate conversion directly.

### 9.4 Navigation Policy

Support three navigation modes:

- embedded SDK navigation
- system map deep link
- third-party app external launch

Default recommendation:

- simple "go there" journeys use external navigation
- only route-heavy, in-app guided experiences use embedded navigation SDKs

## 10. Android Packaging Strategy

### 10.1 Flavor Model

Use Android `productFlavors` with at least:

- flavor dimension: `region`
  - `cn`
  - `global`

Optionally add:

- flavor dimension: `distribution`
  - `internal`
  - `store`

### 10.2 Responsibilities per Flavor

Each flavor controls:

- `applicationId`
- app name/resources
- provider SDK dependencies
- manifest placeholders
- region-specific service configuration files
- API defaults

### 10.3 Package Recommendations

- `android-cn`
  - HMS Push
  - mainland map provider
  - mainland network/CDN defaults

- `android-global`
  - FCM
  - Google Maps
  - overseas network/CDN defaults

## 11. iOS Packaging Strategy

### 11.1 Scheme and Build Configuration Model

Use:

- schemes
  - `OpenChat-CN`
  - `OpenChat-Global`

- build configurations
  - `Debug-CN`
  - `Release-CN`
  - `Debug-Global`
  - `Release-Global`

- `.xcconfig` files for region-specific values

### 11.2 Profile Responsibilities

iOS profile-specific values include:

- `PRODUCT_BUNDLE_IDENTIFIER`
- display name
- API base URL
- feature flags
- provider keys
- capability toggles
- privacy purpose strings where needed

## 12. Web and PWA Strategy

Web/PWA must use the same profile semantics:

- `VITE_REGION`
- `VITE_ENVIRONMENT`
- `VITE_DISTRIBUTION`

Web/PWA region profiles control:

- API host
- CDN
- map provider defaults
- browser push availability
- regional legal links
- PWA app name and branding

PWA remains an enhancement layer, not a replacement for native provider assumptions.

## 13. Regional Provider Registry

Introduce a provider registry that resolves:

- default providers from build profile
- runtime provider selection from capability checks
- fallback path if the default provider is unavailable

This registry must drive:

- push
- map
- geocoding
- navigation
- analytics
- crash reporting

## 14. Compliance and Regional Policy Layer

Regional architecture must also provide first-class slots for:

- privacy consent differences
- local legal links
- content policy switches
- telemetry routing
- account/login provider availability
- payment provider availability

These are not all required in phase one, but the architecture must explicitly reserve this layer.

## 15. Secrets and Configuration Management

### 15.1 Rules

- Public web config only via safe `VITE_*` values.
- Native secrets and provider config files must be separated by region/profile.
- Do not ship multiple regions' production provider files into one release path unless explicitly required by a validated fallback strategy.

### 15.2 Region-Specific Assets

Expected examples:

- Android:
  - `google-services.json` only in global flavor path
  - `agconnect-services.json` only in mainland flavor path

- iOS:
  - scheme/config-driven plist and build settings

## 16. Build and Release Artifact Standard

Release artifacts should encode:

- app name
- region
- platform
- distribution
- environment
- version
- build number

Examples:

- `openchat-cn-android-store-production-1.4.2-304.aab`
- `openchat-global-android-internal-staging-1.4.2-304.apk`
- `openchat-cn-ios-store-production-1.4.2-304.xcarchive`
- `openchat-global-web-production-1.4.2.zip`

## 17. CI/CD Matrix

At minimum, CI must validate:

- `android-cn`
- `android-global`
- `ios-cn`
- `ios-global`
- `web-cn`
- `web-global`

Per-matrix validation should include:

- profile resolution
- provider config presence
- bundle/package id validation
- manifest/plist checks
- packaging script checks
- capability/fallback tests

## 18. Reliability and Operations

### 18.1 Runtime Diagnostics

Log and inspect:

- build profile
- runtime-selected providers
- capability snapshot
- fallback activation
- device service state

### 18.2 Kill Switches

Support:

- provider disable switches
- feature kill switches
- emergency fallback mode
- release profile freeze in CI/CD

## 19. Recommended Phased Rollout

### Phase 1

- introduce profile model
- add provider registry
- add push provider abstraction
- add map/location abstraction

### Phase 2

- add Android flavors
- add iOS schemes/configs
- add region-aware build scripts

### Phase 3

- add packaging and validation gates
- add CI/CD matrix
- add operational diagnostics and kill switches

## 20. Acceptance Criteria

- Mainland and overseas releases are packaged separately with deterministic profile selection.
- Feature packages do not directly depend on regional SDKs.
- Push provider selection is region-aware and runtime-safe.
- Map/location architecture is region-aware and coordinate-system-safe.
- Android uses flavors for region-specific packaging.
- iOS uses schemes/build configurations for region-specific packaging.
- Web/PWA shares the same profile semantics.
- Packaging modes `internal`, `store`, and `enterprise` are supported by the build model.
- Runtime degradation is graceful when a provider is unavailable.
- CI and validation scripts can detect region/provider misconfiguration.

## 21. Result Definition

The target state is:

- one main product codebase
- one regional capability architecture
- one build profile model across web and native
- region-specific packages for mainland and overseas
- runtime fallback instead of fragile runtime-first region selection

This is the recommended architecture for delivering a stable, extensible, and compliant regional mobile app platform for this repository.

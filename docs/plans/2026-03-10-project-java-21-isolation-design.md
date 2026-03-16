# Project Java 21 Isolation Design

## Context

This workspace needs Android and Capacitor workflows to use Java 21, while the same machine keeps Java 25 as the global default for unrelated backend projects.

The repository already includes a project-level Gradle override in `android/gradle.properties`:

```properties
org.gradle.java.home=C:\\Program Files\\Java\\jdk-21
```

That setting helps Gradle itself, but it does not make the full command chain self-explanatory or robust enough for developers who run Android and Capacitor commands from the repository root.

## Problem

We need a project-scoped Java selection strategy that:

- does not change the system-wide Java runtime
- does not interfere with other Java 25 projects
- keeps Android and Capacitor commands deterministic inside this repository
- makes the Java 21 expectation visible in docs and scripts

## Options

### Option 1: Rely only on `android/gradle.properties`

Pros:

- no new code
- Gradle already supports `org.gradle.java.home`

Cons:

- only covers Gradle-owned execution
- does not make the repository contract obvious from root-level commands
- IDE settings can still confuse the situation

### Option 2: Add a repository-local Java wrapper for Android commands

Pros:

- affects only child processes launched by this repository
- keeps global Java 25 untouched
- makes root scripts deterministic
- can reuse the existing `org.gradle.java.home` as the source of truth

Cons:

- adds one small helper script
- requires package script rewiring

### Option 3: Depend on user-managed local Java version switching

Pros:

- no repository script changes

Cons:

- fragile across machines
- not self-contained
- easy to misconfigure

## Decision

Use Option 2.

The repository will keep `android/gradle.properties` as the source of truth for the Android JDK path, then add a small root-level helper script that:

1. reads `org.gradle.java.home` from `android/gradle.properties`
2. resolves and validates the configured Java home
3. launches Android-specific child commands with:
   - `JAVA_HOME=<project java 21 path>`
   - `PATH` prefixed with `<JAVA_HOME>/bin`
4. leaves the parent shell and the rest of the system unchanged

## Scope

### In scope

- repository-local wrapper script for Java 21 child process execution
- Android / Capacitor root script rewiring where Java selection matters
- documentation updates for command-line and Android Studio usage

### Out of scope

- changing system environment variables
- changing other repositories
- introducing external Java version managers

## Command Ownership

The wrapper should be used for commands that must be deterministic for Android workflows from the repository root.

Primary targets:

- `pnpm cap:run:android`
- `pnpm cap:open:android`
- `pnpm dev:android`

Optional support:

- a diagnostic command that prints the effective project Java home

`pnpm cap:sync` can remain unwrapped unless later evidence shows Java-sensitive native execution is required there.

## Testing Strategy

The helper script should be covered with focused tests that verify:

- it reads `org.gradle.java.home` from `android/gradle.properties`
- it injects `JAVA_HOME` and prepends `PATH` for child processes
- it fails clearly when the configured Java home is missing

## Documentation Strategy

Update build and packaging docs so they state:

- this repository uses Java 21 for Android workflows
- global Java 25 can remain the machine default
- Android Studio must also point the project Gradle JDK to Java 21 or respect `org.gradle.java.home`

## Success Criteria

The change is successful when:

- Android commands launched through repository scripts use Java 21 child-process scope
- other projects on the machine remain on Java 25
- the effective behavior is documented in the repository
- focused tests and verification commands confirm the wrapper behavior

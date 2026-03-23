# Chat Mobile React Verification

Run the narrowest useful set first, then broaden before completion:

```bash
pnpm install
pnpm check:sdk-standard
pnpm validate:standards
pnpm typecheck
pnpm test:run
pnpm build
pnpm cap:sync
```

Use `pnpm cap:sync` when native plugins, permissions, or mobile host integration changed. For web-only package work, the SDK checks plus `pnpm build` are the minimum bar.

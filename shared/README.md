# @plokmin/shared

Shared components, hooks, types, rules, and utilities for the PlokminFun monorepo. The public API is the barrel export in [`index.ts`](index.ts) — apps should always import from `@plokmin/shared`, never from internal paths.

## Distribution model: no-emit source library (decision)

**Status:** Accepted (June 2026). Easily reversible — see "Reversal path" below.

`@plokmin/shared` is consumed as **raw TypeScript source**. There is no compile step, no `dist/`, and the `build` script is intentionally a no-op:

```json
"build": "echo 'No build needed for source imports'"
```

### How it's wired

Three things make source imports work:

1. **Workspace link** — apps depend on `"@plokmin/shared": "*"`, which npm workspaces resolves to this directory.
2. **Entry points** — `main` and `types` in [`package.json`](package.json) point directly at `index.ts`.
3. **Vite alias** — each app's `vite.config.ts` aliases `@plokmin/shared` to `../shared/index.ts`, so Vite bundles the shared source as part of the app build.

### Why

- **Zero build orchestration** — no "rebuild shared before the games see changes" step; edits to shared code are picked up instantly by every app's dev server and type checker.
- **Simplest possible fork story** — clone, `npm install`, `npm run dev:<app>`. Nothing to compile in dependency order.
- **Each app owns its toolchain** — shared source is type-checked and bundled under the consuming app's tsconfig and Vite config, so there's no risk of stale or mismatched build artifacts.

### Trade-offs accepted

- The library **cannot be consumed outside this monorepo** (nothing publishable exists).
- Every app re-compiles the shared source (negligible at current scale).
- Apps must support TS source in dependencies (`allowImportingTsExtensions`, bundler module resolution) — already the standard config here.

### Reversal path (if external consumption is ever needed)

The decision is deliberately cheap to reverse:

1. Add a library build (Vite lib mode or tsup) emitting ESM + `.d.ts` to `dist/`.
2. Point `main`/`types` at `dist/` and make `build:shared` a real step (the root `build` script and CI already run it first, so pipeline ordering needs no change).
3. Remove the `@plokmin/shared` aliases from app Vite configs.
4. Add versioning/publishing if distributing via npm.

Until someone needs the library outside the monorepo, none of that complexity is worth carrying.

## Development

```bash
npm test -w shared          # Run shared library tests
npm run test:watch -w shared
```

See [docs/development/monorepo.md](../docs/development/monorepo.md) for workspace conventions.

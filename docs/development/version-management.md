# Version Management

This document describes the version management strategy for the CardGames monorepo, including how to bump versions, when to bump them, and best practices for semantic versioning.

## Table of Contents

- [Semantic Versioning Overview](#semantic-versioning-overview)
- [Current Approach](#current-approach)
- [Updating Versions](#updating-versions)
- [When to Bump Versions](#when-to-bump-versions)
- [Version Display](#version-display)
- [Version History](#version-history)
- [Future: Automated Versioning](#future-automated-versioning)
- [Best Practices](#best-practices)
- [Common Gotchas](#common-gotchas)

## Semantic Versioning Overview

Version numbers follow **Semantic Versioning** (MAJOR.MINOR.PATCH):

- **MAJOR** (1.0.0): Breaking changes, incompatible API changes
- **MINOR** (0.2.0): New features, backwards-compatible
- **PATCH** (0.2.1): Bug fixes, backwards-compatible

**Current version**: `0.2.0` (displayed in bottom-right corner of game)

### Beta Releases (Pre-1.0.0)

The project currently uses **0.x.y versioning** to indicate pre-release status:

- Use 0.x.y versioning to indicate the project is not yet stable
- Breaking changes are allowed in minor versions during pre-1.0.0
- Bump to 1.0.0 when ready for stable public release

## Current Approach

Currently, we use **manual versioning** with `npm version` commands. This approach is simple, predictable, and appropriate for the current development phase.

### Package Locations

Each package has its own `package.json` with version information:

```
CardGames/
├── package.json              # Root workspace (version not displayed)
├── freecell-mvp/package.json # FreeCell version (e.g., 0.2.0)
├── klondike-mvp/package.json # Klondike version (e.g., 0.2.0)
└── shared/package.json       # Shared library version (e.g., 0.2.0)
```

## Updating Versions

### Using npm (Recommended)

The recommended way to update versions is using `npm version` commands:

```bash
cd freecell-mvp

# Bump patch version (0.2.0 → 0.2.1) - for bug fixes
npm version patch

# Bump minor version (0.2.0 → 0.3.0) - for new features
npm version minor

# Bump major version (0.2.0 → 1.0.0) - for breaking changes
npm version major
```

**What `npm version` does:**

1. Updates `package.json` and `package-lock.json`
2. Creates a git commit with message "Bump version to X.Y.Z"
3. Creates a git tag (e.g., `v0.2.0`)

**After running `npm version`:**

```bash
# Push changes and tags to remote
git push && git push --tags
```

### Manual Approach (Not Recommended)

You can also manually edit the version field in `package.json`:

```json
{
  "name": "freecell-mvp",
  "version": "0.3.0",
  ...
}
```

**Drawbacks:**
- Must manually commit changes
- Must manually create git tags
- No automatic package-lock.json update
- More error-prone

## When to Bump Versions

### PATCH Version (0.2.0 → 0.2.1)

Bump the patch version for:

- **Bug fixes** - Fixing incorrect behavior
- **Performance improvements** - Optimizing existing code
- **Documentation updates** - README, comments, guides
- **Refactoring** - Code restructuring without behavior changes
- **Dependency updates** - Updating package dependencies for security or bug fixes

**Examples:**
- Fix card stacking validation bug
- Optimize deck shuffling algorithm
- Update README with new screenshots
- Refactor component structure without changing UI

### MINOR Version (0.2.0 → 0.3.0)

Bump the minor version for:

- **New features** - Adding new functionality
- **New game modes** - Draw-1 vs Draw-3 in Klondike
- **New options** - Settings, accessibility features
- **Backwards-compatible enhancements** - Improving existing features without breaking them

**Examples:**
- Add responsive layout support
- Implement undo/redo system
- Add accessibility settings (high contrast, card size)
- Add new game variant (e.g., Spider Solitaire)

### MAJOR Version (0.2.0 → 1.0.0)

Bump the major version for:

- **Breaking changes to saved games** - Incompatible game state format
- **Major architectural changes** - Complete refactor of state management
- **Removal of features** - Removing supported functionality
- **API changes** - Breaking changes if the library is consumed by others

**Examples:**
- Change game state format (breaks localStorage saved games)
- Remove deprecated features
- Major refactor that changes public API
- First stable release (0.x.y → 1.0.0)

## Version Display

The version is automatically displayed in the game footer by reading from `package.json`:

```typescript
// freecell-mvp/src/components/GameBoard.tsx
import { version } from '../../package.json';

// Rendered in footer
<div className="version">v{version}</div>
```

**TypeScript Configuration:**

To allow importing JSON files, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

## Version History

### v0.1.0 (Initial Release)

- Core FreeCell gameplay
- Click-to-select and drag-and-drop
- Hints system
- Seed-based games
- GitHub Pages deployment

### v0.2.0 (Responsive Layout)

- Viewport-based dynamic sizing
- Touch optimization
- Mobile/tablet/desktop support
- Responsive UI elements
- Accessibility settings

### Future Versions

See `ROADMAP.md` for planned features in upcoming versions.

## Future: Automated Versioning

Once the project matures, consider automating version bumps using one of these approaches:

### Option 1: GitHub Actions on Merge

Add version bump automation when PRs are merged to `main`:

```yaml
# .github/workflows/version-bump.yml
name: Auto Version Bump
on:
  push:
    branches: [main]

jobs:
  bump-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Bump version
        run: |
          cd freecell-mvp
          npm version patch -m "chore: bump version to %s [skip ci]"
      - name: Push changes
        run: |
          git push
          git push --tags
```

**Pros:**
- Simple implementation
- Always bumps patch version
- Automatic on merge

**Cons:**
- No control over bump type (always patch)
- Requires `[skip ci]` to prevent infinite loops

### Option 2: Semantic Release

Automatically determine version bumps from commit messages:

```bash
cd freecell-mvp
npm install -D semantic-release @semantic-release/git @semantic-release/changelog

# Configure with .releaserc.json
```

**Commit message format:**
- `feat: ...` → Minor version bump (0.2.0 → 0.3.0)
- `fix: ...` → Patch version bump (0.2.0 → 0.2.1)
- `BREAKING CHANGE: ...` → Major version bump (0.2.0 → 1.0.0)

**Pros:**
- Intelligent version bumping
- Automatic changelog generation
- Industry standard (used by Angular, React, etc.)

**Cons:**
- Requires strict commit message format
- More complex setup
- Learning curve for contributors

### Option 3: Changesets

Manual changeset files + automated versioning:

```bash
npm install -D @changesets/cli
npx changeset init

# When making changes:
npx changeset  # Interactive prompt for version bump type
npx changeset version  # Updates versions
```

**Pros:**
- Flexible - manual control with automation
- Great for monorepos
- Handles dependencies between packages

**Cons:**
- Requires discipline to create changesets
- Extra step in development workflow

### Recommendation

**For now**: Continue with **manual versioning** using `npm version` until version 1.0.0.

**Post-1.0.0**: Consider **semantic-release** for automated versioning based on commit messages, or **changesets** if you need more control in a monorepo context.

## Best Practices

### 1. Version in Sync Across Packages

Keep all package versions in sync during development:

```bash
# Update all packages to same version
cd freecell-mvp && npm version minor
cd ../klondike-mvp && npm version minor
cd ../shared && npm version minor
```

### 2. Tag After Versioning

Always tag releases for easy reference:

```bash
git tag -a v0.3.0 -m "Release v0.3.0: Add undo/redo system"
git push --tags
```

### 3. Update CHANGELOG

Maintain a `CHANGELOG.md` file documenting changes in each version:

```markdown
## [0.3.0] - 2025-01-15

### Added
- Undo/redo system with keyboard shortcuts
- Settings modal for accessibility options

### Fixed
- Card overlap calculation on mobile devices
```

### 4. Version Before Deploying

Always bump the version before merging to `main`:

```bash
# On feature branch, before creating PR
npm version minor
git push --tags
```

### 5. Communicate Breaking Changes

For major version bumps, clearly document breaking changes:

- Update README with migration guide
- Add deprecation warnings before removing features
- Provide clear error messages

## Common Gotchas

### 1. Forgetting to Push Tags

After running `npm version`, you must push both commits and tags:

```bash
# ❌ Wrong - only pushes commits
git push

# ✅ Correct - pushes both commits and tags
git push && git push --tags
```

### 2. Version Mismatch in Monorepo

In a monorepo, versions can get out of sync. Use a script to keep them aligned:

```bash
# Root package.json script
"scripts": {
  "version:all": "npm version $VERSION -w freecell-mvp -w klondike-mvp -w shared"
}

# Usage
npm run version:all -- minor
```

### 3. package-lock.json Conflicts

Running `npm version` updates `package-lock.json`. When merging branches, resolve conflicts carefully:

```bash
# If conflicts occur
npm install  # Regenerate package-lock.json
```

### 4. Version in Git Tags vs package.json

Ensure git tags match `package.json` versions:

```bash
# Check current version
cat package.json | grep version

# Check latest tag
git describe --tags --abbrev=0
```

### 5. Pre-release Versions

For beta/alpha releases, use pre-release identifiers:

```bash
npm version 0.3.0-beta.1
npm version 0.3.0-beta.2
npm version 0.3.0  # Final release
```

## Related Documentation

- [Monorepo Management](./monorepo.md) - Managing versions across multiple packages
- [Testing](./testing.md) - Testing before version releases
- `ROADMAP.md` - Planned features for future versions
- `STATUS.md` - Current version and sprint status

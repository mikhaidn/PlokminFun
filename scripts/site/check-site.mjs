/**
 * Site integrity check — run as part of `npm run validate` and in CI.
 *
 * Catches the "added an app but it 404s on Pages" class of error before
 * merge by verifying that every deployable app is consistently wired:
 *   - workspace dir and package.json exist (apps.mjs throws otherwise)
 *   - has a build script
 *   - slug is unique and URL-safe
 *   - vite.config.ts base path matches `<basePath>/<slug>/`
 *   - landing page metadata is complete and the page renders
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { rootDir, getApps, getSiteConfig } from './apps.mjs';
import { renderLanding } from './generate-landing.mjs';

const errors = [];
const site = getSiteConfig();
const apps = getApps();

if (apps.length === 0) {
  errors.push('No deployable apps found (no workspace has a `plokmin` block in package.json)');
}

const slugs = new Map();
for (const app of apps) {
  const where = `${app.dir}/package.json`;

  if (!/^[a-z][a-z0-9-]*$/.test(app.slug)) {
    errors.push(`${where}: slug "${app.slug}" must be kebab-case (lowercase, hyphens only)`);
  }
  if (slugs.has(app.slug)) {
    errors.push(`${where}: slug "${app.slug}" already used by ${slugs.get(app.slug)}`);
  }
  slugs.set(app.slug, app.dir);

  if (!app.pkg.scripts?.build) {
    errors.push(`${where}: deployable app has no "build" script`);
  }
  if (!app.pkg.plokmin.title || !app.pkg.plokmin.description) {
    errors.push(`${where}: plokmin block needs "title" and "description" for the landing page`);
  }

  const viteConfigPath = path.join(rootDir, app.dir, 'vite.config.ts');
  if (!existsSync(viteConfigPath)) {
    errors.push(`${app.dir}: missing vite.config.ts`);
  } else {
    const expectedBase = `${site.basePath}/${app.slug}/`;
    const viteConfig = readFileSync(viteConfigPath, 'utf8');
    if (!viteConfig.includes(`'${expectedBase}'`) && !viteConfig.includes(`"${expectedBase}"`)) {
      errors.push(
        `${app.dir}/vite.config.ts: base path must be '${expectedBase}' ` +
          `(matching the app's slug) or the app will 404 on GitHub Pages`
      );
    }
  }
}

try {
  const html = renderLanding({ apps });
  for (const app of apps) {
    if (!html.includes(`href="./${app.slug}/"`)) {
      errors.push(`Landing page failed to include a card for ${app.dir}`);
    }
  }
} catch (err) {
  errors.push(`Landing page generation failed: ${err.message}`);
}

if (errors.length > 0) {
  console.error(`✗ Site integrity check failed (${errors.length} problem(s)):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ Site integrity check passed: ${apps.length} deployable apps`);
for (const app of apps) {
  console.log(`  - ${app.dir} → ${site.basePath}/${app.slug}/ (${app.icon} ${app.title})`);
}

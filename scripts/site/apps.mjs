/**
 * App discovery for the Plokmin site build.
 *
 * An app is "deployable" when its package.json has a `plokmin` metadata
 * block. Everything else (e.g. the shared library) is skipped. This is the
 * single source of truth for the deploy workflow, the generated landing
 * page, and the integrity check — adding a workspace with a `plokmin`
 * block is ALL that's needed to ship a new app.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function getSiteConfig() {
  const rootPkg = readJson(path.join(rootDir, 'package.json'));
  const site = rootPkg.plokmin;
  if (!site || !site.basePath) {
    throw new Error('Root package.json must define plokmin.basePath (e.g. "/PlokminFun")');
  }
  return site;
}

/**
 * Returns deployable apps in landing-page order:
 * { dir, slug, title, icon, description, cta, order, pkg }
 */
export function getApps() {
  const rootPkg = readJson(path.join(rootDir, 'package.json'));
  const apps = [];

  for (const dir of rootPkg.workspaces) {
    const pkgPath = path.join(rootDir, dir, 'package.json');
    if (!existsSync(pkgPath)) {
      throw new Error(`Workspace "${dir}" is listed in root package.json but has no package.json`);
    }
    const pkg = readJson(pkgPath);
    if (!pkg.plokmin) continue;

    const meta = pkg.plokmin;
    apps.push({
      dir,
      slug: meta.slug ?? dir,
      title: meta.title ?? dir,
      icon: meta.icon ?? '✨',
      description: meta.description ?? '',
      cta: meta.cta ?? 'Try Now',
      order: meta.order ?? 999,
      pkg,
    });
  }

  apps.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return apps;
}

export function getPlannedApps() {
  const plannedPath = path.join(rootDir, 'scripts', 'site', 'planned-apps.json');
  return existsSync(plannedPath) ? readJson(plannedPath) : [];
}

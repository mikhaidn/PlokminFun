/**
 * Builds the full GitHub Pages site into _site/:
 *   1. Builds every deployable app (workspaces with a `plokmin` block)
 *   2. Copies each app's dist/ to _site/<slug>/
 *   3. Generates the landing page at _site/index.html
 *
 * This is what the deploy workflow runs — and it can be run locally to
 * preview exactly what will ship: `npm run build:site`
 */
import { execSync } from 'node:child_process';
import { rmSync, mkdirSync, cpSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { rootDir, getApps } from './apps.mjs';
import { renderLanding } from './generate-landing.mjs';

const siteDir = path.join(rootDir, '_site');
const apps = getApps();

console.log(`Building site with ${apps.length} apps: ${apps.map((a) => a.slug).join(', ')}\n`);

for (const app of apps) {
  console.log(`▶ Building ${app.dir}...`);
  execSync(`npm run build -w ${app.dir}`, { cwd: rootDir, stdio: 'inherit' });
}

rmSync(siteDir, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });

for (const app of apps) {
  const distDir = path.join(rootDir, app.dir, 'dist');
  if (!existsSync(distDir)) {
    console.error(`✗ ${app.dir} built but produced no dist/ directory`);
    process.exit(1);
  }
  cpSync(distDir, path.join(siteDir, app.slug), { recursive: true });
  console.log(`✓ ${app.dir}/dist → _site/${app.slug}/`);
}

writeFileSync(path.join(siteDir, 'index.html'), renderLanding({ apps }));
console.log('✓ Generated _site/index.html');
console.log(`\nSite ready in _site/ (${apps.length} apps + landing page)`);

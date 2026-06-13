/**
 * Generates the landing page (index.html) from app metadata.
 *
 * The page is generated at site-build time (see build-site.mjs) — it is
 * NOT checked into the repo, so it can never drift from the actual set of
 * deployed apps. Available cards come from each workspace's `plokmin`
 * package.json block; planned cards come from planned-apps.json.
 *
 * Usage: node scripts/site/generate-landing.mjs [outFile]
 *        (prints to stdout when no outFile is given)
 */
import { writeFileSync } from 'node:fs';
import { getApps, getPlannedApps } from './apps.mjs';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function appCard(app) {
  return `          <a href="./${app.slug}/" class="game-card">
            <div class="game-icon">${app.icon}</div>
            <h2>${escapeHtml(app.title)}</h2>
            <p>${escapeHtml(app.description)}</p>
            <span class="status available">${escapeHtml(app.cta)}</span>
          </a>`;
}

function plannedCard(app) {
  return `            <div class="game-card scheduled">
              <div class="game-icon">${app.icon}</div>
              <h2>${escapeHtml(app.title)}</h2>
              <p>${escapeHtml(app.description)}</p>
              <span class="status coming-soon">Planned</span>
            </div>`;
}

export function renderLanding({ apps = getApps(), planned = getPlannedApps() } = {}) {
  const plannedSection =
    planned.length === 0
      ? ''
      : `
        <details class="scheduled-games">
          <summary>
            <h3>🗓️ Scheduled Games</h3>
            <p class="scheduled-subtitle">Games planned for future releases</p>
          </summary>

          <div class="games-grid scheduled-grid">
${planned.map(plannedCard).join('\n\n')}
          </div>
        </details>
`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Plokmin Consortium</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .container {
        max-width: 1200px;
        width: 100%;
      }

      header {
        text-align: center;
        margin-bottom: 60px;
        color: white;
      }

      h1 {
        font-size: 3.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      }

      .subtitle {
        font-size: 1.3rem;
        opacity: 0.95;
        font-weight: 300;
      }

      .games-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
        margin-bottom: 40px;
      }

      .game-card {
        background: white;
        border-radius: 16px;
        padding: 40px 30px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
        text-decoration: none;
        color: inherit;
        display: block;
      }

      .game-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
      }

      .game-icon {
        font-size: 4rem;
        margin-bottom: 20px;
      }

      .game-card h2 {
        font-size: 1.8rem;
        margin-bottom: 12px;
        color: #333;
      }

      .game-card p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .status {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .status.available {
        background: #10b981;
        color: white;
      }

      .status.coming-soon {
        background: #8b5cf6;
        color: white;
      }

      .scheduled-games {
        margin-top: 60px;
        padding: 30px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        backdrop-filter: blur(10px);
      }

      .scheduled-games summary {
        cursor: pointer;
        list-style: none;
        text-align: center;
        color: white;
        padding: 20px;
        user-select: none;
      }

      .scheduled-games summary::-webkit-details-marker {
        display: none;
      }

      .scheduled-games summary h3 {
        font-size: 1.8rem;
        margin-bottom: 8px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .scheduled-games summary h3::after {
        content: '▼';
        font-size: 1.2rem;
        transition: transform 0.3s ease;
      }

      .scheduled-games[open] summary h3::after {
        transform: rotate(180deg);
      }

      .scheduled-subtitle {
        font-size: 1rem;
        opacity: 0.9;
        margin-top: 4px;
      }

      .scheduled-games summary:hover {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
      }

      .scheduled-grid {
        margin-top: 30px;
        animation: slideDown 0.3s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .game-card.scheduled {
        opacity: 0.75;
        cursor: default;
      }

      .game-card.scheduled:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
        opacity: 0.85;
      }

      footer {
        text-align: center;
        color: white;
        padding: 40px 20px 20px;
      }

      footer a {
        color: white;
        text-decoration: underline;
        opacity: 0.9;
        transition: opacity 0.2s;
      }

      footer a:hover {
        opacity: 1;
      }

      @media (max-width: 768px) {
        h1 {
          font-size: 2.5rem;
        }

        .subtitle {
          font-size: 1.1rem;
        }

        .games-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <h1>✨ Plokmin Consortium</h1>
        <p class="subtitle">A collection of interactive web experiences</p>
      </header>

      <main>
        <div class="games-grid">
${apps.map(appCard).join('\n\n')}
        </div>
${plannedSection}      </main>

      <footer>
        <p>Built with React, TypeScript, and Vite</p>
        <p>
          <a href="https://github.com/mikhaidn/PlokminFun" target="_blank" rel="noopener"
            >View on GitHub</a
          >
        </p>
      </footer>
    </div>
  </body>
</html>
`;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain) {
  const html = renderLanding();
  const outFile = process.argv[2];
  if (outFile) {
    writeFileSync(outFile, html);
    console.log(`Landing page written to ${outFile}`);
  } else {
    process.stdout.write(html);
  }
}

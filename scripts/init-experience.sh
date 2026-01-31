#!/bin/bash

# init-experience.sh - Create a new Plokmin Consortium experience
# Usage: ./scripts/init-experience.sh experience-name

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print helpers
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Validate arguments
if [ $# -ne 1 ]; then
  error "Usage: ./scripts/init-experience.sh experience-name"
  echo "  Example: ./scripts/init-experience.sh habit-tracker"
  exit 1
fi

EXPERIENCE_NAME="$1"

# Validate name format (kebab-case)
if [[ ! "$EXPERIENCE_NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
  error "Experience name must be kebab-case (lowercase, hyphens only)"
  echo "  Valid: habit-tracker, my-app, todo-list"
  echo "  Invalid: HabitTracker, habit_tracker, 123-app"
  exit 1
fi

# Check if directory already exists
if [ -d "$EXPERIENCE_NAME" ]; then
  error "Directory '$EXPERIENCE_NAME' already exists!"
  exit 1
fi

# Convert kebab-case to Title Case for display names
TITLE_CASE=$(echo "$EXPERIENCE_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')
PACKAGE_NAME="@plokmin/$EXPERIENCE_NAME"

info "Creating new experience: $TITLE_CASE"
echo ""

# Create directory structure
info "Creating directory structure..."
mkdir -p "$EXPERIENCE_NAME"/{src,public}
success "Directories created"

# Create package.json
info "Generating package.json..."
cat > "$EXPERIENCE_NAME/package.json" <<EOF
{
  "name": "$PACKAGE_NAME",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "typescript": "^5.6.2",
    "typescript-eslint": "^8.46.4",
    "vite": "^5.4.11",
    "vitest": "^2.1.5"
  }
}
EOF
success "package.json created"

# Create tsconfig.json
info "Generating tsconfig.json..."
cat > "$EXPERIENCE_NAME/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
success "tsconfig.json created"

# Create tsconfig.node.json
info "Generating tsconfig.node.json..."
cat > "$EXPERIENCE_NAME/tsconfig.node.json" <<'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
EOF
success "tsconfig.node.json created"

# Create vite.config.ts
info "Generating vite.config.ts..."
cat > "$EXPERIENCE_NAME/vite.config.ts" <<EOF
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/CardGames/$EXPERIENCE_NAME/',
  build: {
    outDir: 'dist',
  },
});
EOF
success "vite.config.ts created"

# Create eslint.config.js
info "Generating eslint.config.js..."
cat > "$EXPERIENCE_NAME/eslint.config.js" <<'EOF'
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  }
);
EOF
success "eslint.config.js created"

# Create index.html
info "Generating index.html..."
cat > "$EXPERIENCE_NAME/index.html" <<EOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="$TITLE_CASE - Part of the Plokmin Consortium" />
    <meta name="theme-color" content="#667eea" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="manifest" href="/manifest.json" />
    <title>$TITLE_CASE | Plokmin Consortium</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
success "index.html created"

# Create manifest.json
info "Generating manifest.json..."
cat > "$EXPERIENCE_NAME/public/manifest.json" <<EOF
{
  "name": "$TITLE_CASE",
  "short_name": "$TITLE_CASE",
  "description": "$TITLE_CASE - Part of the Plokmin Consortium",
  "start_url": "/CardGames/$EXPERIENCE_NAME/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/CardGames/$EXPERIENCE_NAME/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ],
  "categories": ["lifestyle", "utilities"]
}
EOF
success "manifest.json created"

# Create default icon.svg (simple circle with first letter)
info "Generating default icon..."
FIRST_LETTER=$(echo "$TITLE_CASE" | cut -c1)
cat > "$EXPERIENCE_NAME/public/icon.svg" <<EOF
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#667eea" rx="64"/>
  <text x="256" y="356" font-size="280" font-weight="bold" text-anchor="middle" fill="white" font-family="sans-serif">$FIRST_LETTER</text>
</svg>
EOF
success "Default icon created"

# Create service-worker.js (basic offline support)
info "Generating service worker..."
cat > "$EXPERIENCE_NAME/public/service-worker.js" <<'EOF'
// Basic service worker for offline support
const CACHE_NAME = 'plokmin-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
EOF
success "Service worker created"

# Create src/main.tsx
info "Generating src/main.tsx..."
cat > "$EXPERIENCE_NAME/src/main.tsx" <<'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Service worker registration failed, app still works
    });
  });
}
EOF
success "src/main.tsx created"

# Create src/App.tsx
info "Generating src/App.tsx..."
cat > "$EXPERIENCE_NAME/src/App.tsx" <<EOF
import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="header">
        <h1>$TITLE_CASE</h1>
        <p className="subtitle">Part of the Plokmin Consortium</p>
      </header>

      <main className="main">
        <div className="card">
          <h2>Welcome! 👋</h2>
          <p>This is your new experience scaffold.</p>
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
          <p className="hint">
            Edit <code>src/App.tsx</code> to customize this page.
          </p>
        </div>
      </main>

      <footer className="footer">
        <a href="/CardGames/">← Back to Plokmin Consortium</a>
      </footer>
    </div>
  );
}

export default App;
EOF
success "src/App.tsx created"

# Create src/App.css
info "Generating src/App.css..."
cat > "$EXPERIENCE_NAME/src/App.css" <<'EOF'
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  padding: 3rem 1rem 2rem;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.card h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

.card p {
  margin-bottom: 1.5rem;
  color: #666;
  line-height: 1.6;
}

.card button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.card button:active {
  transform: translateY(0);
}

.hint {
  font-size: 0.9rem;
  margin-top: 1.5rem;
}

.hint code {
  background: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
}

.footer {
  text-align: center;
  padding: 2rem;
}

.footer a {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.footer a:hover {
  opacity: 1;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }

  .card {
    padding: 2rem 1.5rem;
  }
}
EOF
success "src/App.css created"

# Create README.md
info "Generating README.md..."
cat > "$EXPERIENCE_NAME/README.md" <<EOF
# $TITLE_CASE

A Plokmin Consortium experience.

## Description

<!-- TODO: Add description of what this experience does -->

## Features

<!-- TODO: List key features -->

## Development

\`\`\`bash
# Install dependencies (from repo root)
npm install

# Start dev server
npm run dev:${EXPERIENCE_NAME}

# Build for production
npm run build -w $EXPERIENCE_NAME

# Type checking
npm run typecheck
\`\`\`

## Architecture

- **React + TypeScript**: Type-safe component architecture
- **Vite**: Fast dev server and optimized builds
- **PWA**: Installable, offline-capable progressive web app

## Customization

1. **Update icon**: Edit \`public/icon.svg\` or replace with PNG/ICO
2. **Update manifest**: Edit \`public/manifest.json\` for app metadata
3. **Update styles**: Edit \`src/App.css\` for custom styling
4. **Add features**: Create new components in \`src/components/\`

## Part of Plokmin Consortium

This experience is one of many interactive web apps in the Plokmin collection.

**Live at**: https://mikhaidn.github.io/CardGames/$EXPERIENCE_NAME/
EOF
success "README.md created"

# Update root package.json
info "Updating root package.json..."

# Add to workspaces
if ! grep -q "\"$EXPERIENCE_NAME\"" package.json; then
  # Use Node.js to properly update the JSON file
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.workspaces.push('$EXPERIENCE_NAME');
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  "
  success "Added to workspaces"
fi

# Add dev script
SCRIPT_KEY="dev:$(echo $EXPERIENCE_NAME | sed 's/-//g' | cut -c1-10)"
if ! grep -q "\"$SCRIPT_KEY\"" package.json; then
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts['$SCRIPT_KEY'] = 'npm run dev -w $EXPERIENCE_NAME';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  "
  success "Added dev:$SCRIPT_KEY script"
fi

# Update typecheck script
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const current = pkg.scripts.typecheck;
  if (!current.includes('$EXPERIENCE_NAME')) {
    pkg.scripts.typecheck = current + ' && tsc --noEmit -p $EXPERIENCE_NAME/tsconfig.json';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  }
"
success "Updated typecheck script"

# Update lint:fix script
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const current = pkg.scripts['lint:fix'];
  if (!current.includes('$EXPERIENCE_NAME')) {
    pkg.scripts['lint:fix'] = current + ' && npm run lint -w $EXPERIENCE_NAME -- --fix';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  }
"
success "Updated lint:fix script"

# Update index.html
info "Updating landing page (index.html)..."
# Insert new card before the closing </div> of games-grid
# Find "</div>" followed by "</main>" and insert before the first </div>
CARD_HTML="          <a href=\"./${EXPERIENCE_NAME}/\" class=\"game-card\">
            <div class=\"game-icon\">✨</div>
            <h2>${TITLE_CASE}</h2>
            <p>${TITLE_CASE} - Part of the Plokmin Consortium.</p>
            <span class=\"status available\">Try Now</span>
          </a>
"
# Use perl for more reliable multiline matching
perl -i.bak -pe 'BEGIN{undef $/;} s{(        </div>\n)(      </main>)}{'"$(echo "$CARD_HTML" | sed 's/\\/\\\\/g; s/&/\\&/g')"'\n$1$2}' index.html
rm -f index.html.bak
success "Added card to landing page"

# Install dependencies
info "Installing dependencies..."
npm install --silent
success "Dependencies installed"

# Done!
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Experience '$TITLE_CASE' created successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Customize: ${YELLOW}$EXPERIENCE_NAME/README.md${NC}, ${YELLOW}src/App.tsx${NC}"
echo -e "  2. Run dev:   ${YELLOW}npm run $SCRIPT_KEY${NC}"
echo -e "  3. Deploy:    ${YELLOW}git add . && git commit -m 'feat: add $EXPERIENCE_NAME' && git push${NC}"
echo ""
echo -e "${BLUE}Live URL (after deploy):${NC}"
echo -e "  ${YELLOW}https://mikhaidn.github.io/CardGames/$EXPERIENCE_NAME/${NC}"
echo ""
echo -e "${BLUE}Customize:${NC}"
echo -e "  • Icon:        ${YELLOW}$EXPERIENCE_NAME/public/icon.svg${NC}"
echo -e "  • Manifest:    ${YELLOW}$EXPERIENCE_NAME/public/manifest.json${NC}"
echo -e "  • Landing:     ${YELLOW}index.html${NC} (change icon from ✨ to something meaningful)"
echo ""

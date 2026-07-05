import './styles.css';
import { runCode, type ReplResult } from './repl';
import { EXAMPLES } from './examples';
import { encodeCode, decodeCode } from './share';

const DEFAULT_CODE = EXAMPLES[0].code;

const editor = document.querySelector<HTMLTextAreaElement>('#editor')!;
const output = document.querySelector<HTMLDivElement>('#output')!;
const runBtn = document.querySelector<HTMLButtonElement>('#run')!;
const clearBtn = document.querySelector<HTMLButtonElement>('#clear')!;
const shareBtn = document.querySelector<HTMLButtonElement>('#share')!;
const examplePicker = document.querySelector<HTMLSelectElement>('#examples')!;

/** Populate the examples dropdown. */
for (const example of EXAMPLES) {
  const opt = document.createElement('option');
  opt.value = example.id;
  opt.textContent = example.label;
  examplePicker.append(opt);
}

/** Render a REPL result into the output panel. */
function render(result: ReplResult): void {
  output.replaceChildren();

  for (const entry of result.logs) {
    output.append(line(entry.text, entry.level));
  }
  if (result.error !== null) {
    output.append(line(result.error, 'error'));
  } else if (result.hasValue && result.value !== null) {
    output.append(line(result.value, 'value'));
  }

  if (output.childElementCount === 0) {
    output.append(line('(no output)', 'muted'));
  }
  output.scrollTop = output.scrollHeight;
}

function line(text: string, kind: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `out-line out-${kind}`;
  el.textContent = text;
  return el;
}

function run(): void {
  render(runCode(editor.value));
}

/** Copy a shareable link (code packed into the URL hash) to the clipboard. */
async function share(): Promise<void> {
  const url = `${location.origin}${location.pathname}#code=${encodeCode(editor.value)}`;
  history.replaceState(null, '', url);
  const original = shareBtn.textContent;
  try {
    await navigator.clipboard.writeText(url);
    shareBtn.textContent = 'Link copied!';
  } catch {
    shareBtn.textContent = 'Link in address bar';
  }
  setTimeout(() => {
    shareBtn.textContent = original;
  }, 1500);
}

runBtn.addEventListener('click', run);
clearBtn.addEventListener('click', () => {
  editor.value = '';
  output.replaceChildren();
  editor.focus();
});
shareBtn.addEventListener('click', share);
examplePicker.addEventListener('change', () => {
  const example = EXAMPLES.find((e) => e.id === examplePicker.value);
  if (example) {
    editor.value = example.code;
    run();
  }
  examplePicker.selectedIndex = 0;
});

// Ctrl/Cmd+Enter runs the code from anywhere in the editor.
editor.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault();
    run();
  }
});

/** Load shared code from the URL hash if present, else the default snippet. */
function loadInitialCode(): void {
  const match = location.hash.match(/#code=(.+)$/);
  if (match) {
    const decoded = decodeCode(match[1]);
    if (decoded !== null) {
      editor.value = decoded;
      run();
      return;
    }
  }
  editor.value = DEFAULT_CODE;
  run();
}

loadInitialCode();

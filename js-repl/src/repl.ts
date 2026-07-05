/**
 * The REPL engine: evaluate a snippet of JavaScript in the page and capture
 * everything a console user would want to see — console output, the value of
 * the final expression, and any error.
 *
 * Evaluation happens client-side via `new Function`, so this is a playground,
 * not a sandbox: code runs with the same privileges as the page. That is the
 * point (instant, zero-infrastructure, works offline), and it is why the app
 * only ever runs code the user typed themselves.
 */

export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  text: string;
}

export interface ReplResult {
  /** Anything written via console.* during the run, in order. */
  logs: LogEntry[];
  /** The value of the final expression, formatted for display. */
  value: string | null;
  /** True when the snippet ended in an expression that produced a value. */
  hasValue: boolean;
  /** Formatted error message, or null when the run succeeded. */
  error: string | null;
}

/** Depth-limited, cycle-safe formatting of an arbitrary value for display. */
export function formatValue(value: unknown, depth = 0, seen = new WeakSet<object>()): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const type = typeof value;
  if (type === 'string') return depth === 0 ? (value as string) : JSON.stringify(value);
  if (type === 'number' || type === 'boolean' || type === 'bigint') {
    return String(value) + (type === 'bigint' ? 'n' : '');
  }
  if (type === 'symbol') return String(value);
  if (type === 'function') {
    const name = (value as { name?: string }).name;
    return name ? `[Function: ${name}]` : '[Function (anonymous)]';
  }

  // Objects from here down.
  const obj = value as object;
  if (seen.has(obj)) return '[Circular]';
  if (depth > 4) return Array.isArray(obj) ? '[Array]' : '[Object]';
  seen.add(obj);

  try {
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (Array.isArray(value)) {
      return '[' + value.map((v) => formatValue(v, depth + 1, seen)).join(', ') + ']';
    }
    if (value instanceof Map) {
      const entries = [...value.entries()].map(
        ([k, v]) => `${formatValue(k, depth + 1, seen)} => ${formatValue(v, depth + 1, seen)}`
      );
      return `Map(${value.size}) {${entries.length ? ' ' + entries.join(', ') + ' ' : ''}}`;
    }
    if (value instanceof Set) {
      const items = [...value.values()].map((v) => formatValue(v, depth + 1, seen));
      return `Set(${value.size}) {${items.length ? ' ' + items.join(', ') + ' ' : ''}}`;
    }

    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => `${k}: ${formatValue(v, depth + 1, seen)}`
    );
    return `{${entries.length ? ' ' + entries.join(', ') + ' ' : ''}}`;
  } finally {
    seen.delete(obj);
  }
}

/** Format a console.* call's arguments the way a devtools console would join them. */
function formatArgs(args: unknown[]): string {
  return args.map((a) => formatValue(a)).join(' ');
}

/**
 * Run a JavaScript snippet and capture its output.
 *
 * The snippet is first tried as a single expression (so `2 + 2` shows `4`,
 * like a real REPL). If that is not valid expression syntax, it is re-run as
 * a statement block, and the final value is left undefined.
 */
export function runCode(code: string): ReplResult {
  const logs: LogEntry[] = [];
  const record =
    (level: LogLevel) =>
    (...args: unknown[]): void => {
      // Return undefined (like a real console.*), not push()'s array length,
      // so a trailing `console.log(x)` doesn't get echoed as a value.
      logs.push({ level, text: formatArgs(args) });
    };

  const sandboxConsole = {
    log: record('log'),
    info: record('info'),
    warn: record('warn'),
    error: record('error'),
    debug: record('log'),
  };

  const trimmed = code.trim();
  if (trimmed === '') {
    return { logs, value: null, hasValue: false, error: null };
  }

  // Decide (without executing) whether the whole snippet is a single
  // expression. If it is, wrapping it in `return (...)` lets object and array
  // literals echo as values (`{ a: 1 }` is an object, not a labelled block).
  // Otherwise fall back to `eval`, whose completion value is the value of the
  // final statement — so `console.log(x); 2 ** 10` still echoes 1024, exactly
  // like a devtools console.
  let runner: (console: typeof sandboxConsole) => unknown;
  try {
    // Parse-only check — `new Function` compiles but does not run the body.
    new Function(`return (\n${code}\n);`);
    runner = new Function('console', `return (\n${code}\n);`) as typeof runner;
  } catch {
    try {
      runner = new Function(
        'console',
        '__source__',
        'return eval(__source__);'
      ) as unknown as typeof runner;
    } catch (err) {
      return { logs, value: null, hasValue: false, error: formatError(err) };
    }
    return finish(() => (runner as (c: unknown, s: string) => unknown)(sandboxConsole, code), logs);
  }

  return finish(() => runner(sandboxConsole), logs);
}

/** Execute a prepared runner and package its result (or error). */
function finish(exec: () => unknown, logs: LogEntry[]): ReplResult {
  try {
    const result = exec();
    if (result !== undefined) {
      return { logs, value: formatValue(result), hasValue: true, error: null };
    }
    return { logs, value: null, hasValue: false, error: null };
  } catch (err) {
    return { logs, value: null, hasValue: false, error: formatError(err) };
  }
}

function formatError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}

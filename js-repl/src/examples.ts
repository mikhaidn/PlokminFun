/** Snippets for the examples picker. Keep them short and self-contained. */
export interface Example {
  id: string;
  label: string;
  code: string;
}

export const EXAMPLES: Example[] = [
  {
    id: 'hello',
    label: 'Hello, world',
    code: `console.log('Hello, world!');\n\n// The value of the last expression is echoed too:\n2 ** 10;`,
  },
  {
    id: 'fizzbuzz',
    label: 'FizzBuzz',
    code: `for (let n = 1; n <= 15; n++) {\n  const s =\n    (n % 3 ? '' : 'Fizz') + (n % 5 ? '' : 'Buzz');\n  console.log(s || n);\n}`,
  },
  {
    id: 'array',
    label: 'Array methods',
    code: `const nums = [1, 2, 3, 4, 5, 6];\nnums\n  .filter((n) => n % 2 === 0)\n  .map((n) => n * n);`,
  },
  {
    id: 'objects',
    label: 'Objects & Map',
    code: `const counts = new Map();\nfor (const ch of 'mississippi') {\n  counts.set(ch, (counts.get(ch) ?? 0) + 1);\n}\ncounts;`,
  },
  {
    id: 'fib',
    label: 'Fibonacci',
    code: `const fib = (n) =>\n  n < 2 ? n : fib(n - 1) + fib(n - 2);\n\nArray.from({ length: 10 }, (_, i) => fib(i));`,
  },
  {
    id: 'error',
    label: 'Catching errors',
    code: `try {\n  JSON.parse('{ not valid }');\n} catch (err) {\n  console.error('Parse failed:', err.message);\n}`,
  },
];

/**
 * Two-way binding between a Y.Text and a plain <textarea>/<input>.
 *
 * Local edits: the element's new value is diffed against the CRDT text as a
 * single replaced span (which is what a keystroke, paste or cut produces) and
 * applied as delete+insert inside one transaction tagged LOCAL_ORIGIN.
 *
 * Remote edits: the element value is replaced and the caret/selection is
 * carried across by mapping it through the event delta, so someone typing
 * elsewhere in the document doesn't yank your cursor around.
 */
import type * as Y from 'yjs';

export const LOCAL_ORIGIN = 'local';

export interface TextChange {
  index: number;
  remove: number;
  insert: string;
}

/** Minimal single-span diff via common prefix/suffix. Null when identical. */
export function diffText(before: string, after: string): TextChange | null {
  if (before === after) return null;
  let start = 0;
  const max = Math.min(before.length, after.length);
  while (start < max && before[start] === after[start]) start++;

  let endBefore = before.length;
  let endAfter = after.length;
  while (endBefore > start && endAfter > start && before[endBefore - 1] === after[endAfter - 1]) {
    endBefore--;
    endAfter--;
  }
  return { index: start, remove: endBefore - start, insert: after.slice(start, endAfter) };
}

export interface DeltaOp {
  retain?: number;
  delete?: number;
  insert?: string | object;
}

/** Maps a caret position in the pre-change text to its position afterwards. */
export function mapPosition(delta: DeltaOp[], index: number): number {
  let cursor = 0; // position in the old text
  let result = index;
  for (const op of delta) {
    if (cursor >= index) break;
    if (op.retain !== undefined) {
      cursor += op.retain;
    } else if (op.delete !== undefined) {
      result -= Math.min(op.delete, index - cursor);
      cursor += op.delete;
    } else if (op.insert !== undefined) {
      result += typeof op.insert === 'string' ? op.insert.length : 1;
    }
  }
  return Math.max(0, result);
}

export type BindableElement = HTMLTextAreaElement | HTMLInputElement;

/** Binds `text` to `el`; returns an unbind function. */
export function bindText(text: Y.Text, el: BindableElement): () => void {
  el.value = text.toString();

  const onInput = () => {
    const change = diffText(text.toString(), el.value);
    if (!change) return;
    text.doc!.transact(() => {
      if (change.remove > 0) text.delete(change.index, change.remove);
      if (change.insert) text.insert(change.index, change.insert);
    }, LOCAL_ORIGIN);
  };

  const onRemote = (event: Y.YTextEvent, txn: Y.Transaction) => {
    if (txn.origin === LOCAL_ORIGIN) return;
    const delta = event.delta as DeltaOp[];
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? start;
    const focused = document.activeElement === el;
    el.value = text.toString();
    if (focused) el.setSelectionRange(mapPosition(delta, start), mapPosition(delta, end));
  };

  el.addEventListener('input', onInput);
  text.observe(onRemote);
  return () => {
    el.removeEventListener('input', onInput);
    text.unobserve(onRemote);
  };
}

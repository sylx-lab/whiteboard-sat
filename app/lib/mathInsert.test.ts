/**
 * Run with: node --test app/lib/mathInsert.test.ts
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { isInsideMath, buildInsertion } from './mathInsert.ts';

test('prose is not math', () => {
  assert.equal(isInsideMath('what is x', 5), false);
});

test('inside a single-dollar span is math', () => {
  //           0123456789
  assert.equal(isInsideMath('a $x+1$ b', 4), true);
});

test('after a closed span is not math', () => {
  assert.equal(isInsideMath('a $x+1$ b', 8), false);
});

test('treats $$ as one delimiter, so inside display math is math', () => {
  assert.equal(isInsideMath('a $$x+1$$ b', 5), true);
  assert.equal(isInsideMath('a $$x+1$$ b', 10), false);
});

test('an escaped dollar is not a delimiter', () => {
  assert.equal(isInsideMath('costs \\$5 and x', 14), false);
});

test('a backslash command inside math does not break tracking', () => {
  const text = '$\\frac{1}{2}$ done';
  assert.equal(isInsideMath(text, 6), true);
  assert.equal(isInsideMath(text, 17), false);
});

test('wraps a snippet in $ when inserting into prose', () => {
  const r = buildInsertion({ text: 'value ', selectionStart: 6, selectionEnd: 6, latex: '\\sqrt{}' });
  assert.equal(r.text, 'value $\\sqrt{}$');
  // caret sits inside the empty braces
  assert.equal(r.text.slice(r.caret, r.caret + 1), '}');
});

test('does not double-wrap when already inside math', () => {
  const r = buildInsertion({ text: '$x + $', selectionStart: 5, selectionEnd: 5, latex: '\\pi' });
  assert.equal(r.text, '$x + \\pi$');
});

test('moves the selection into the first brace slot', () => {
  const r = buildInsertion({ text: 'x+1', selectionStart: 0, selectionEnd: 3, latex: '\\sqrt{}' });
  assert.equal(r.text, '$\\sqrt{x+1}$');
  assert.equal(r.selectionLength, 3);
  assert.equal(r.text.slice(r.caret, r.caret + r.selectionLength), 'x+1');
});

test('fills only the first slot of a two-slot snippet', () => {
  const r = buildInsertion({ text: 'a', selectionStart: 0, selectionEnd: 1, latex: '\\frac{}{}' });
  assert.equal(r.text, '$\\frac{a}{}$');
});

test('caret goes to the end when the snippet has no slot', () => {
  const r = buildInsertion({ text: '', selectionStart: 0, selectionEnd: 0, latex: '\\pm' });
  assert.equal(r.text, '$\\pm$');
  assert.equal(r.caret, r.text.length);
});

test('replaces the selected range rather than appending', () => {
  const r = buildInsertion({ text: 'keep DROP tail', selectionStart: 5, selectionEnd: 9, latex: '\\pm' });
  assert.equal(r.text, 'keep $\\pm$ tail');
});

test('clamps out-of-range selections instead of producing undefined', () => {
  const r = buildInsertion({ text: 'ab', selectionStart: 99, selectionEnd: 99, latex: '\\pi' });
  assert.equal(r.text, 'ab$\\pi$');
});

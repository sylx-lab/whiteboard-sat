import assert from 'node:assert/strict';
import test from 'node:test';
import { formatMathString } from './mathFormat.ts';

test('renders explicit single dollar math', () => {
  const result = formatMathString('$x^2 + 1$');
  assert.ok(result.includes('class="katex"'));
  assert.ok(result.includes('x'));
});

test('renders -x^10, -x^7, x^7, x^10 without dollars', () => {
  const r1 = formatMathString('-x^10');
  assert.ok(r1.includes('class="katex"'), '-x^10 should render katex');
  assert.ok(r1.includes('10'), '-x^10 should contain 10 in superscript');

  const r2 = formatMathString('-x^7');
  assert.ok(r2.includes('class="katex"'), '-x^7 should render katex');

  const r3 = formatMathString('x^7');
  assert.ok(r3.includes('class="katex"'), 'x^7 should render katex');

  const r4 = formatMathString('x^10');
  assert.ok(r4.includes('class="katex"'), 'x^10 should render katex');
});

test('renders negative and parenthesized exponents like x^-2 and 10^-5', () => {
  const r1 = formatMathString('x^-2');
  assert.ok(r1.includes('class="katex"'));

  const r2 = formatMathString('10^-5');
  assert.ok(r2.includes('class="katex"'));
});

test('renders parenthesized base and exponent like (x+1)^2 and 2^(n-1)', () => {
  const r1 = formatMathString('(x+1)^2');
  assert.ok(r1.includes('class="katex"'));

  const r2 = formatMathString('2^(n-1)');
  assert.ok(r2.includes('class="katex"'));
});

test('renders raw latex commands like \\frac{1}{2} without dollars', () => {
  const r = formatMathString('\\frac{1}{2}');
  assert.ok(r.includes('class="katex"'));
});

test('handles sentences with embedded caret math', () => {
  const r = formatMathString('Compare x^7 and -x^10 for x > 0.');
  assert.ok(r.includes('class="katex"'));
  assert.ok(r.includes('Compare'));
  assert.ok(r.includes('for x &gt; 0') || r.includes('for x > 0'));
});

test('preserves plain English text without caret or math', () => {
  const r = formatMathString('The correct answer is Option A because it satisfies the equation.');
  assert.ok(!r.includes('class="katex"'));
  assert.equal(r, 'The correct answer is Option A because it satisfies the equation.');
});
